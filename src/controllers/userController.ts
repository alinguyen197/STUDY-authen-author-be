import { NextFunction, Request, Response } from 'express'
import userService from '../services/userService'
import { ApiResponder } from '../utils'
const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userService.getAllUsers()

    return ApiResponder.success(res, users)
  } catch (error) {
    next(error)
  }
}

export default {
  getAllUsers,
}
