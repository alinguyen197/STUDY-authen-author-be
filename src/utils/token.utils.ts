import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { TokenPayload } from '../interfaces/auth.interface'
import { TOKEN_CONFIG } from './constants'

export class TokenUtils {
  static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, process.env.JWT_SECRET_KEY!, {
      expiresIn: TOKEN_CONFIG.ACCESS_TOKEN_EXPIRATION as any,
    })
  }

  static generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex')
  }

  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex')
  }

  static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, process.env.JWT_SECRET_KEY!) as TokenPayload
  }

  static generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString()
  }

  static hashOTP(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex')
  }
}
