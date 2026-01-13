import jwt from 'jsonwebtoken'
import { IUser, LoginResponse } from '../interfaces'
import User from '../models/user.model'
import { ApiResponder, checkFormatEmail } from '../utils'
import { parseError } from '../utils/parseError.common'
import { comparePassword, hashPassword } from '../utils/utils.common'
import { OTP_CONFIG, REDIS_KEYS, TOKEN_CONFIG } from '../utils/constants'
import { TokenUtils } from '../utils/token.utils'
import RefreshToken from '../models/refreshToken.model'
import redisClient from '../config/redis'
import db from '../models'
import { Transaction } from 'sequelize'
import emailService from './emailService'

class AuthService {
  login(payload: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const { ip, user, deviceInfo } = payload
        // Validate
        if (!user || !user.email) {
          reject({
            type: 'ValidationError',
            message: 'Email is required',
          })
        }

        if (!checkFormatEmail(user.email)) {
          reject({
            type: 'ValidationError',
            message: 'Email invalid format',
          })
        }

        if (!user || !user.password) {
          reject({
            type: 'ValidationError',
            message: 'Password is required',
          })
        }
        // find user in database
        //  userDB.get({ plain: true }) => convert to javascript object
        const userDB = await User.findOne({
          where: { email: user.email },
        })

        if (!userDB) {
          reject({
            type: 'NotFoundError',
            message: 'User not exist',
          })
        } else {
          const pass = await hashPassword(userDB.password)

          const isPasswordValid = await comparePassword(user.password, pass)
          if (!isPasswordValid) {
            reject({
              type: 'ValidationError',
              message: 'Password not correct',
            })
          }

          // check 2FA
          if (userDB?.otpEnabled) {
            // send OTP and require OTP verification
            const otpId = await this.sendLoginOTP(userDB)

            resolve({
              requireOTP: true,
              otpId,
            })
          } else {
            const tokenData = await this.generateTokensForUser(
              userDB,
              deviceInfo,
              ip
            )
            resolve(tokenData)
          }
        }
      } catch (error: any) {
        reject(parseError(error))
      }
    })
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
    // 1. Check rate limit
    const rateLimitKey = REDIS_KEYS.OTP_RATE_LIMIT(user.id)
    const requestCount = await redisClient.get(rateLimitKey)

    if (requestCount && parseInt(requestCount) >= OTP_CONFIG.RATE_LIMIT) {
      throw new Error('Too many OTP requests. Please try again later.')
    }

    // 2. Generate OTP
    const otp = TokenUtils.generateOTP()
    const otpHash = TokenUtils.hashOTP(otp)

    const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRATION * 1000)

    // 3. Delete old OTPs
    await db.Otp.destroy({ where: { userId: user.id } })

    // 4. Save new OTP
    const otpRecord = await db.Otp.create({
      userId: user.id,
      code: otp,
      codeHash: otpHash,
      expiresAt,
      attempts: 0,
      verified: false,
      purpose: 'login',
    })

    // 5. Update rate limit
    await redisClient.incr(rateLimitKey)
    await redisClient.expire(rateLimitKey, 15 * 60) // 15 minutes

    // 6. Send OTP via email
    await emailService.sendOTP(user.email, otp)

    // 7. Return OTP ID (để verify sau)
    return otpRecord.id.toString()
  }
}

export default new AuthService()
