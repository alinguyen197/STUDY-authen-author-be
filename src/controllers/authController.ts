import { NextFunction, Request, Response } from 'express'
import { IUser } from '../interfaces'
import authServices from '../services/authService'
import { ApiResponder } from '../utils/response.common'
import emailService from '../services/emailService'
// get infor request
import { UAParser } from 'ua-parser-js'
const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Lấy dữ liệu từ request body
    // Lấy IP (xử lý proxy)
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    const ua = new UAParser(req.headers['user-agent']).getResult()

    const payload = {
      user: req.body,
      deviceInfo: {
        type: ua.device.type ?? 'desktop',
        vendor: ua.device.vendor ?? null,
        model: ua.device.model ?? null,
      },
      ip,
    }

    // set refresh token in httpOnly cookie
    const { accessToken, refreshToken, ...rest } = (await authServices.login(
      payload
    )) as any
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    return ApiResponder.success(res, {
      accessToken,
      ...rest,
    })
  } catch (error: any) {
    next(error)
  }
}

const otp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body

    await emailService.sendOTP(email, '12345')

    return ApiResponder.success(res)
  } catch (error) {
    next(error)
  }
}

export default {
  login,
  otp,
}
