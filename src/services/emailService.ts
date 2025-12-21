import nodemailer from 'nodemailer'
import { parseError } from '../utils'

class EmailService {
  private transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })
  }

  async sendOTP(email: string, otp: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const mailOptions = {
          from: process.env.EMAIL_FROM,
          to: email,
          subject: 'Your OTP Login Code',
          html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>OTP Login Code</h2>
            <p>Your OTP code is:</p>
            <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
            <p>This code will expire in ${process.env.OTP_EXPIRATION || 300} seconds.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
        `,
        }
        const info = await this.transporter.sendMail(mailOptions)
        resolve(info)
      } catch (error) {
        reject(parseError(error))
      }
    })
  }

  async sendSecurityAlert(email: string, message: string) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '🔒 Security Alert',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #f44336;">Security Alert</h2>
          <p>${message}</p>
          <p>If this wasn't you, please change your password immediately.</p>
          <p>Time: ${new Date().toLocaleString()}</p>
        </div>
      `,
    }

    await this.transporter.sendMail(mailOptions)
  }

  async sendTokenCleanupNotification(email: string, count: number) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Token Cleanup Notification',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Token Cleanup</h2>
          <p>${count} expired or old tokens have been removed from your account.</p>
          <p>Time: ${new Date().toLocaleString()}</p>
        </div>
      `,
    }

    await this.transporter.sendMail(mailOptions)
  }
}

export default new EmailService()
