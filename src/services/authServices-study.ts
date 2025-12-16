import { Transaction } from 'sequelize'
import bcrypt from 'bcrypt'
import db from '../models'
import redisClient from '../config/redis'
import emailService from './emailService'
import { TokenUtils } from '../utils/token.utils'
import { TOKEN_CONFIG, OTP_CONFIG, REDIS_KEYS } from '../utils/constants'
import {
  RefreshTokenData,
  OTPData,
  LoginResponse,
} from '../interfaces/auth.interface'

class AuthService {
  // ==================== REGISTER ====================
  async register(email: string, password: string, username: string) {
    const existingUser = await db.User.findOne({ where: { email } })
    if (existingUser) {
      throw new Error('Email already exists')
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await db.User.create({
      email,
      password: hashedPassword,
      username,
    })

    return {
      id: user.id,
      email: user.email,
      username: user.name,
    }
  }

  // ==================== LOGIN WITH PASSWORD ====================
  async login(
    email: string,
    password: string,
    deviceInfo?: string,
    ipAddress?: string
  ): Promise<LoginResponse> {
    const user = await db.User.findOne({ where: { email } })
    if (!user) {
      throw new Error('Invalid credentials')
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new Error('Invalid credentials')
    }

    return this.generateTokensForUser(user, deviceInfo, ipAddress)
  }

  // ==================== OTP LOGIN ====================
  async requestOTP(email: string): Promise<void> {
    if (!OTP_CONFIG.ENABLED) {
      throw new Error('OTP login is disabled')
    }

    const user = await db.User.findOne({ where: { email } })
    if (!user) {
      throw new Error('User not found')
    }

    // Check rate limit
    const rateLimitKey = REDIS_KEYS.OTP_RATE_LIMIT(user.id)
    const requestCount = await redisClient.get(rateLimitKey)

    if (requestCount && parseInt(requestCount) >= OTP_CONFIG.RATE_LIMIT) {
      throw new Error('Too many OTP requests. Please try again later.')
    }

    // Generate OTP
    const otp = TokenUtils.generateOTP()
    const otpHash = TokenUtils.hashOTP(otp)
    const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRATION * 1000)

    // Delete old OTPs for this user
    await db.Otp.destroy({ where: { userId: user.id } })

    // Save new OTP
    await db.Otp.create({
      userId: user.id,
      otpHash,
      expiresAt,
      attempts: 0,
      verified: false,
    })

    // Update rate limit
    await redisClient.incr(rateLimitKey)
    await redisClient.expire(rateLimitKey, 15 * 60) // 15 minutes

    // Send OTP via email
    await emailService.sendOTP(email, otp)
  }

  async verifyOTP(
    email: string,
    otp: string,
    deviceInfo?: string,
    ipAddress?: string
  ): Promise<LoginResponse> {
    if (!OTP_CONFIG.ENABLED) {
      throw new Error('OTP login is disabled')
    }

    const user = await db.User.findOne({ where: { email } })
    if (!user) {
      throw new Error('User not found')
    }

    const otpHash = TokenUtils.hashOTP(otp)
    const otpRecord = await db.Otp.findOne({
      where: {
        userId: user.id,
        otpHash,
        verified: false,
      },
    })

    if (!otpRecord) {
      throw new Error('Invalid OTP')
    }

    // Check expiration
    if (new Date() > otpRecord.expiresAt) {
      await otpRecord.destroy()
      throw new Error('OTP has expired')
    }

    // Check max attempts
    if (otpRecord.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
      await otpRecord.destroy()
      throw new Error('Maximum OTP attempts exceeded')
    }

    // Mark as verified and delete
    await otpRecord.update({ verified: true })
    await otpRecord.destroy()

    return this.generateTokensForUser(user, deviceInfo, ipAddress)
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
          deviceInfo,
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

  // ==================== TOKEN REFRESH ====================
  async refreshToken(
    refreshToken: string,
    deviceInfo?: string,
    ipAddress?: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenHash = TokenUtils.hashToken(refreshToken)
    const transaction = await db.sequelize.transaction()

    try {
      // Check Redis cache first
      const cachedToken = await redisClient.get(
        REDIS_KEYS.REFRESH_TOKEN(tokenHash)
      )

      let tokenRecord
      if (cachedToken) {
        const { tokenId } = JSON.parse(cachedToken)
        tokenRecord = await db.RefreshToken.findByPk(tokenId, { transaction })
      } else {
        tokenRecord = await db.RefreshToken.findOne({
          where: { tokenHash },
          transaction,
        })
      }

      if (!tokenRecord) {
        throw new Error('Invalid refresh token')
      }

      // ===== REUSE DETECTION =====
      if (tokenRecord.revoked) {
        // Token reuse detected! Revoke all user's tokens
        await this.revokeAllUserTokens(tokenRecord.userId, transaction)

        const user = await db.User.findByPk(tokenRecord.userId)
        if (user) {
          await emailService.sendSecurityAlert(
            user.email,
            'Suspicious activity detected: Token reuse. All your sessions have been revoked.'
          )
        }

        await transaction.commit()
        throw new Error('Token reuse detected. All sessions revoked.')
      }

      // Check expiration
      if (new Date() > tokenRecord.expiresAt) {
        await tokenRecord.update(
          { revoked: true, revokedAt: new Date() },
          { transaction }
        )
        await transaction.commit()
        throw new Error('Refresh token expired')
      }

      // ===== TOKEN ROTATION =====
      // Generate new tokens
      const user = await db.User.findByPk(tokenRecord.userId)
      if (!user) {
        throw new Error('User not found')
      }

      const newAccessToken = TokenUtils.generateAccessToken({
        userId: user.id,
        email: user.email,
      })

      const newRefreshToken = TokenUtils.generateRefreshToken()
      const newTokenHash = TokenUtils.hashToken(newRefreshToken)
      const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

      // Create new refresh token
      const newTokenRecord = await db.RefreshToken.create(
        {
          userId: user.id,
          tokenHash: newTokenHash,
          deviceInfo,
          ipAddress,
          expiresAt: newExpiresAt,
          revoked: false,
        },
        { transaction }
      )

      // Revoke old token and link to new one (audit trail)
      await tokenRecord.update(
        {
          revoked: true,
          revokedAt: new Date(),
          replacedBy: newTokenRecord.id,
        },
        { transaction }
      )

      // Update Redis
      await redisClient.del(REDIS_KEYS.REFRESH_TOKEN(tokenHash))
      await redisClient.setex(
        REDIS_KEYS.REFRESH_TOKEN(newTokenHash),
        7 * 24 * 60 * 60,
        JSON.stringify({
          userId: user.id,
          tokenId: newTokenRecord.id,
          expiresAt: newExpiresAt.toISOString(),
        })
      )

      // Clean up old tokens
      await this.cleanupOldTokens(user.id, transaction)

      await transaction.commit()

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      }
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  // ==================== LOGOUT ====================
  async logout(refreshToken: string): Promise<void> {
    const tokenHash = TokenUtils.hashToken(refreshToken)
    const transaction = await db.sequelize.transaction()

    try {
      const tokenRecord = await db.RefreshToken.findOne({
        where: { tokenHash },
        transaction,
      })

      if (tokenRecord) {
        await tokenRecord.update(
          { revoked: true, revokedAt: new Date() },
          { transaction }
        )

        await redisClient.del(REDIS_KEYS.REFRESH_TOKEN(tokenHash))
      }

      await transaction.commit()
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async logoutAll(userId: number): Promise<void> {
    const transaction = await db.sequelize.transaction()

    try {
      await this.revokeAllUserTokens(userId, transaction)
      await transaction.commit()
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  // ==================== HELPER METHODS ====================
  private async revokeAllUserTokens(
    userId: number,
    transaction: Transaction
  ): Promise<void> {
    const tokens = await db.RefreshToken.findAll({
      where: { userId, revoked: false },
      transaction,
    })

    for (const token of tokens) {
      await token.update(
        { revoked: true, revokedAt: new Date() },
        { transaction }
      )

      await redisClient.del(REDIS_KEYS.REFRESH_TOKEN(token.tokenHash))
    }
  }

  private async cleanupOldTokens(
    userId: number,
    transaction: Transaction
  ): Promise<void> {
    const activeTokens = await db.RefreshToken.findAll({
      where: { userId, revoked: false },
      order: [['createdAt', 'DESC']],
      transaction,
    })

    if (activeTokens.length >= TOKEN_CONFIG.MAX_ACTIVE_TOKENS) {
      const tokensToRevoke = activeTokens.slice(
        TOKEN_CONFIG.MAX_ACTIVE_TOKENS - 1
      )

      for (const token of tokensToRevoke) {
        await token.update(
          { revoked: true, revokedAt: new Date() },
          { transaction }
        )

        await redisClient.del(REDIS_KEYS.REFRESH_TOKEN(token.tokenHash))
      }
    }
  }

  // ==================== CLEANUP EXPIRED TOKENS & OTPs ====================
  async cleanupExpiredTokens(): Promise<number> {
    const transaction = await db.sequelize.transaction()

    try {
      const expiredTokens = await db.RefreshToken.findAll({
        where: {
          expiresAt: { [db.Op.lt]: new Date() },
          revoked: false,
        },
        transaction,
      })

      for (const token of expiredTokens) {
        await token.update(
          { revoked: true, revokedAt: new Date() },
          { transaction }
        )

        await redisClient.del(REDIS_KEYS.REFRESH_TOKEN(token.tokenHash))
      }

      await transaction.commit()
      return expiredTokens.length
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async cleanupExpiredOTPs(): Promise<number> {
    const deletedCount = await db.Otp.destroy({
      where: {
        expiresAt: { [db.Op.lt]: new Date() },
      },
    })

    return deletedCount
  }
}

export default new AuthService()
