import jwt from 'jsonwebtoken'
import { LoginResponse } from '../interfaces'
import User from '../models/user.model'
import { ApiResponder, checkFormatEmail } from '../utils'
import { comparePassword, hashPassword } from '../utils/utils.common'
import { OTP_CONFIG, REDIS_KEYS, TOKEN_CONFIG } from '../utils/constants'
import { TokenUtils } from '../utils/token.utils'
import RefreshToken from '../models/refreshToken.model'
import redisClient from '../config/redis'
import db from '../models'
import { Transaction } from 'sequelize'
import emailService from './emailService'

class AuthService {
  async login(payload: any) {
    const { ip, user, deviceInfo } = payload

    if (!user || !user.email) {
      throw {
        type: 'ValidationError',
        message: 'Email is required',
      }
    }

    if (!checkFormatEmail(user.email)) {
      throw {
        type: 'ValidationError',
        message: 'Email invalid format',
      }
    }

    if (!user || !user.password) {
      throw {
        type: 'ValidationError',
        message: 'Password is required',
      }
    }

    const userDB = await User.findOne({
      where: { email: user.email },
    })

    if (!userDB) {
      throw {
        type: 'NotFoundError',
        message: 'User not exist',
      }
    }

    const pass = await hashPassword(userDB.password)
    const isPasswordValid = await comparePassword(user.password, pass)

    if (!isPasswordValid) {
      throw {
        type: 'ValidationError',
        message: 'Password not correct',
      }
    }

    if (userDB?.otpEnabled && userDB?.otpVerified) {
      const otpId = await this.sendLoginOTP(userDB)
      return {
        requireOTP: true,
        otpId,
      }
    }

    return this.generateTokensForUser(userDB, deviceInfo, ip)
  }

  // ==================== TOKEN GENERATION ====================
  private async generateTokensForUser(
    user: any,
    deviceInfo?: string,
    ipAddress?: string
  ): Promise<LoginResponse> {
    const transaction = await db.sequelize.transaction()

    try {
      // Generate tokens
      const accessToken = TokenUtils.generateAccessToken({
        userId: user.id,
        email: user.email,
      })

      const refreshToken = TokenUtils.generateRefreshToken()
      const tokenHash = TokenUtils.hashToken(refreshToken)
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

      // Clean up old tokens if exceeds limit
      await this.cleanupOldTokens(user.id, transaction)

      // Save refresh token
      const savedToken = await db.RefreshToken.create(
        {
          userId: user.id,
          tokenHash,
          deviceInfo: JSON.stringify(deviceInfo),
          ipAddress,
          expiresAt,
          revoked: false,
        },
        { transaction }
      )

      // Cache in Redis
      await redisClient.setex(
        REDIS_KEYS.REFRESH_TOKEN(tokenHash),
        7 * 24 * 60 * 60,
        JSON.stringify({
          userId: user.id,
          tokenId: savedToken.id,
          expiresAt: expiresAt.toISOString(),
        })
      )

      await transaction.commit()

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      }
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  // ==================== TOKEN CLEANUP ====================
  // clear old tokens exceeding the max active tokens limit
  private async cleanupOldTokens(
    userId: number,
    transaction: Transaction
  ): Promise<void> {
    // lấy ra một mảng số token của một user chưa bị thu hồi
    // sắp xếp theo thời gian tạo mới nhất
    const activeTokens = await db.RefreshToken.findAll({
      where: { userId, revoked: false },
      order: [['createdAt', 'DESC']],
      transaction,
    })

    // kiểm tra nếu số token vượt quá giới hạn
    if (activeTokens.length >= TOKEN_CONFIG.MAX_ACTIVE_TOKENS) {
      // lấy ra thằng token cũ nhất để thu hồi
      const tokensToRevoke = activeTokens.slice(
        TOKEN_CONFIG.MAX_ACTIVE_TOKENS - 1
      )

      for (const token of tokensToRevoke) {
        // thu hồi nó trong database
        await token.update(
          { revoked: true, revokedAt: new Date() },
          { transaction }
        )

        // thu hồi nó trong redis
        await redisClient.del(REDIS_KEYS.REFRESH_TOKEN(token.tokenHash))
      }
    }
  }

  // ==================== 2FA HANDLING SEND OTP ====================
  private async sendLoginOTP(user: any): Promise<string> {
    const rateLimitKey = REDIS_KEYS.OTP_RATE_LIMIT(user.id)
    const requestCount = await redisClient.get(rateLimitKey)

    if (requestCount && parseInt(requestCount) >= OTP_CONFIG.RATE_LIMIT) {
      throw {
        type: 'ValidationError',
        message: 'Too many OTP requests. Please try again later.',
      }
    }

    const otp = TokenUtils.generateOTP()
    const otpHash = TokenUtils.hashOTP(otp)
    const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRATION * 1000)

    await db.Otp.destroy({ where: { userId: user.id } })

    const otpRecord = await db.Otp.create({
      userId: user.id,
      code: otp,
      codeHash: otpHash,
      expiresAt,
      attempts: 0,
      verified: false,
      purpose: 'login',
    })

    await redisClient.incr(rateLimitKey)
    await redisClient.expire(rateLimitKey, 15 * 60)

    await emailService.sendOTP(user.email, otp)

    return otpRecord.id.toString()
  }

  // ==================== 2FA HANDLING VERIFY OTP ====================
  async verifyLoginOTP(
    otpId: string,
    otp: string,
    deviceInfo?: string,
    ipAddress?: string
  ): Promise<LoginResponse> {
    const otpRecord = await db.Otp.findByPk(otpId)
    if (!otpRecord) {
      throw {
        type: 'ValidationError',
        message: 'Invalid OTP session',
      }
    }

    const otpHash = TokenUtils.hashOTP(otp)
    if (otpRecord.codeHash !== otpHash) {
      await otpRecord.increment('attempts')

      if (otpRecord.attempts + 1 >= OTP_CONFIG.MAX_ATTEMPTS) {
        await otpRecord.destroy()
        throw {
          type: 'ValidationError',
          message: 'Maximum OTP attempts exceeded',
        }
      }

      throw {
        type: 'ValidationError',
        message: 'Invalid OTP',
      }
    }

    if (new Date() > otpRecord.expiresAt) {
      await otpRecord.destroy()
      throw {
        type: 'ValidationError',
        message: 'OTP has expired',
      }
    }

    const user = await db.User.findByPk(otpRecord.userId)
    if (!user) {
      throw {
        type: 'NotFoundError',
        message: 'User not found',
      }
    }

    await otpRecord.destroy()
    return this.generateTokensForUser(user, deviceInfo, ipAddress)
  }
}

export default new AuthService()
