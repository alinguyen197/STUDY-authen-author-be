import { NextFunction, Request, Response } from 'express'
import { IUser } from '../interfaces'
import authServices from '../services/authService'
import { ApiResponder } from '../utils/response.common'
import emailService from '../services/emailService'
const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Lấy dữ liệu từ request body
    const data: IUser = req.body
    const user = await authServices.handleLogin(data)
    return ApiResponder.success(res, user)
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
