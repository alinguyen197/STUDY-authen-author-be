import { NextFunction, Request, Response } from 'express'
import { IUser } from '../interfaces'
import authServices from '../services/authService'
import { ApiResponder } from '../utils/response.common'
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

export default {
  login,
}
