import db from '../models'
import { OTP_CONFIG } from '../utils/constants'
import { TokenUtils } from '../utils/token.utils'
import { LoginResponse } from './../interfaces/auth.interface'
import bcrypt from 'bcrypt'
import emailService from './emailService'
// authServices-study.ts

class AuthService {
  // ==================== 2FA MANAGEMENT ====================

  /**
   * Bật 2FA cho user
   */
  async enable2FA(userId: number): Promise<void> {
    const user = await db.User.findByPk(userId)
    if (!user) {
      throw new Error('User not found')
    }

    if (user.otpEnabled) {
      throw new Error('2FA already enabled')
    }

    // Gửi OTP để verify việc bật 2FA
    const otp = TokenUtils.generateOTP()
    const otpHash = TokenUtils.hashOTP(otp)
    const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRATION * 1000)

    await db.Otp.destroy({ where: { userId } })
    await db.Otp.create({
      userId,
      otpHash,
      expiresAt,
      attempts: 0,
      verified: false,
    })

    await emailService.sendOTP(user.email, otp)
  }

  /**
   * Verify và hoàn tất việc bật 2FA
   */
  async verify2FASetup(userId: number, otp: string): Promise<void> {
    const user = await db.User.findByPk(userId)
    if (!user) {
      throw new Error('User not found')
    }

    const otpHash = TokenUtils.hashOTP(otp)
    const otpRecord = await db.Otp.findOne({
      where: { userId, otpHash, verified: false },
    })

    if (!otpRecord) {
      throw new Error('Invalid OTP')
    }

    if (new Date() > otpRecord.expiresAt) {
      await otpRecord.destroy()
      throw new Error('OTP has expired')
    }

    // Bật 2FA
    await user.update({
      otpEnabled: true,
      otpVerified: true,
    })

    await otpRecord.destroy()

    // Gửi email thông báo
    await emailService.send2FAEnabledNotification(user.email)
  }

  /**
   * Tắt 2FA
   */
  async disable2FA(userId: number, password: string): Promise<void> {
    const user = await db.User.findByPk(userId)
    if (!user) {
      throw new Error('User not found')
    }

    // Verify password trước khi tắt 2FA
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new Error('Invalid password')
    }

    await user.update({
      otpEnabled: false,
      otpVerified: false,
    })

    // Xóa OTP cũ
    await db.Otp.destroy({ where: { userId } })

    // Gửi email thông báo
    await emailService.send2FADisabledNotification(user.email)
  }
}
