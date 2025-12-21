// import { LoginResponse } from './../interfaces/auth.interface'
// import bcrypt from 'bcrypt'
// // authServices-study.ts

// class AuthService {
//   async login(
//     email: string,
//     password: string,
//     deviceInfo?: string,
//     ipAddress?: string
//   ): Promise<LoginResponse | { requireOTP: true; otpId: string }> {
//     // 1. Tìm user
//     const user = await db.User.findOne({ where: { email } })
//     if (!user) {
//       throw new Error('Invalid credentials')
//     }

//     // 2. Verify password
//     const isPasswordValid = await bcrypt.compare(password, user.password)
//     if (!isPasswordValid) {
//       throw new Error('Invalid credentials')
//     }

//     // ✅ 3. Kiểm tra user có BẬT 2FA không
//     if (user.otpEnabled && user.otpVerified) {
//       // User đã bật 2FA → Yêu cầu OTP
//       // const otpId = await this.sendLoginOTP(user)

//       return {
//         requireOTP: true,
//         // otpId, // ID để verify OTP sau
//       }
//     }

//     // 4. Không cần OTP → Cấp token luôn
//     // return this.generateTokensForUser(user, deviceInfo, ipAddress)
//   }

//   private async sendLoginOTP(user: any): Promise<string> {
//     // 1. Check rate limit
//     const rateLimitKey = REDIS_KEYS.OTP_RATE_LIMIT(user.id)
//     const requestCount = await redisClient.get(rateLimitKey)

//     if (requestCount && parseInt(requestCount) >= OTP_CONFIG.RATE_LIMIT) {
//       throw new Error('Too many OTP requests. Please try again later.')
//     }

//     // 2. Generate OTP
//     const otp = TokenUtils.generateOTP()
//     const otpHash = TokenUtils.hashOTP(otp)
//     const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRATION * 1000)

//     // 3. Delete old OTPs
//     await db.Otp.destroy({ where: { userId: user.id } })

//     // 4. Save new OTP
//     const otpRecord = await db.Otp.create({
//       userId: user.id,
//       otpHash,
//       expiresAt,
//       attempts: 0,
//       verified: false,
//     })

//     // 5. Update rate limit
//     await redisClient.incr(rateLimitKey)
//     await redisClient.expire(rateLimitKey, 15 * 60) // 15 minutes

//     // 6. Send OTP via email
//     await emailService.sendOTP(user.email, otp)

//     // 7. Return OTP ID (để verify sau)
//     return otpRecord.id.toString()
//   }

//   async verifyLoginOTP(
//     otpId: string,
//     otp: string,
//     deviceInfo?: string,
//     ipAddress?: string
//   ): Promise<LoginResponse> {
//     // 1. Tìm OTP record
//     const otpRecord = await db.Otp.findByPk(otpId)
//     if (!otpRecord) {
//       throw new Error('Invalid OTP session')
//     }

//     // 2. Verify OTP
//     const otpHash = TokenUtils.hashOTP(otp)
//     if (otpRecord.otpHash !== otpHash) {
//       // Tăng số lần thử sai
//       await otpRecord.increment('attempts')

//       if (otpRecord.attempts + 1 >= OTP_CONFIG.MAX_ATTEMPTS) {
//         await otpRecord.destroy()
//         throw new Error('Maximum OTP attempts exceeded')
//       }

//       throw new Error('Invalid OTP')
//     }

//     // 3. Check expiration
//     if (new Date() > otpRecord.expiresAt) {
//       await otpRecord.destroy()
//       throw new Error('OTP has expired')
//     }

//     // 4. Get user
//     const user = await db.User.findByPk(otpRecord.userId)
//     if (!user) {
//       throw new Error('User not found')
//     }

//     // 5. Delete OTP (đã verify thành công)
//     await otpRecord.destroy()

//     // 6. Generate tokens
//     return this.generateTokensForUser(user, deviceInfo, ipAddress)
//   }

//   // ==================== 2FA MANAGEMENT ====================

//   /**
//    * Bật 2FA cho user
//    */
//   async enable2FA(userId: number): Promise<void> {
//     const user = await db.User.findByPk(userId)
//     if (!user) {
//       throw new Error('User not found')
//     }

//     if (user.otpEnabled) {
//       throw new Error('2FA already enabled')
//     }

//     // Gửi OTP để verify việc bật 2FA
//     const otp = TokenUtils.generateOTP()
//     const otpHash = TokenUtils.hashOTP(otp)
//     const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRATION * 1000)

//     await db.Otp.destroy({ where: { userId } })
//     await db.Otp.create({
//       userId,
//       otpHash,
//       expiresAt,
//       attempts: 0,
//       verified: false,
//     })

//     await emailService.sendOTP(user.email, otp)
//   }

//   /**
//    * Verify và hoàn tất việc bật 2FA
//    */
//   async verify2FASetup(userId: number, otp: string): Promise<void> {
//     const user = await db.User.findByPk(userId)
//     if (!user) {
//       throw new Error('User not found')
//     }

//     const otpHash = TokenUtils.hashOTP(otp)
//     const otpRecord = await db.Otp.findOne({
//       where: { userId, otpHash, verified: false },
//     })

//     if (!otpRecord) {
//       throw new Error('Invalid OTP')
//     }

//     if (new Date() > otpRecord.expiresAt) {
//       await otpRecord.destroy()
//       throw new Error('OTP has expired')
//     }

//     // Bật 2FA
//     await user.update({
//       otpEnabled: true,
//       otpVerified: true,
//     })

//     await otpRecord.destroy()

//     // Gửi email thông báo
//     await emailService.send2FAEnabledNotification(user.email)
//   }

//   /**
//    * Tắt 2FA
//    */
//   async disable2FA(userId: number, password: string): Promise<void> {
//     const user = await db.User.findByPk(userId)
//     if (!user) {
//       throw new Error('User not found')
//     }

//     // Verify password trước khi tắt 2FA
//     const isPasswordValid = await bcrypt.compare(password, user.password)
//     if (!isPasswordValid) {
//       throw new Error('Invalid password')
//     }

//     await user.update({
//       otpEnabled: false,
//       otpVerified: false,
//     })

//     // Xóa OTP cũ
//     await db.Otp.destroy({ where: { userId } })

//     // Gửi email thông báo
//     await emailService.send2FADisabledNotification(user.email)
//   }
// }
