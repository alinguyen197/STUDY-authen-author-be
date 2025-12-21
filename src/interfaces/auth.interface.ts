export interface IUser {
  email: string
  password?: string
}

interface JwtPayload {
  id: number
  email: string
}
interface AuthRequest extends Request {
  user?: JwtPayload
}

export interface TokenPayload {
  userId: number
  email: string
  iat?: number
  exp?: number
}

export interface RefreshTokenData {
  userId: number
  deviceInfo?: string
  ipAddress?: string
}

export interface OTPData {
  userId: number
  email: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: number
    email: string
    username: string
  }
}

// ✅ Thêm interface cho response yêu cầu OTP
export interface LoginOTPRequiredResponse {
  requireOTP: true
  otpId: string
  message: string
}

// Union type cho login response
export type LoginResult = LoginResponse | LoginOTPRequiredResponse
