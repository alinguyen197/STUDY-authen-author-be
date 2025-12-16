import cron from 'node-cron'
import authService from '../services/authServices-study'
import db from '../models'
import emailService from '../services/emailService'

class CleanupJob {
  start() {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
      console.log('🧹 Running cleanup job...')

      try {
        // Cleanup expired tokens
        const expiredTokens = await authService.cleanupExpiredTokens()
        console.log(`✅ Cleaned up ${expiredTokens} expired tokens`)

        // Cleanup expired OTPs
        const expiredOTPs = await authService.cleanupExpiredOTPs()
        console.log(`✅ Cleaned up ${expiredOTPs} expired OTPs`)

        // Notify users about token cleanup (optional)
        if (expiredTokens > 0) {
          const affectedUsers = await db.RefreshToken.findAll({
            where: {
              revokedAt: {
                [db.Op.gte]: new Date(Date.now() - 60 * 60 * 1000),
              },
            },
            include: [{ model: db.User, as: 'user' }],
            group: ['userId'],
          })

          //   for (const token of affectedUsers) {
          //     if (token.user) {
          //       await emailService.sendTokenCleanupNotification(
          //         token.user.email,
          //         expiredTokens
          //       )
          //     }
          //   }
        }
      } catch (error) {
        console.error('❌ Cleanup job failed:', error)
      }
    })

    console.log('✅ Cleanup cron job started')
  }
}

export default new CleanupJob()
