import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { ApiResponder, parseError } from '../utils'

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'your_secret_key'

// Extend Request để có user
interface AuthRequest extends Request {
  user?: any
}

export const authenticateJWT = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // return ApiResponder.unauthorized(res, 'No token provided')
    throw {
      type: 'TokenExpiredError',
      message: 'No token provided',
    }
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY)
    req.user = decoded // attach payload vào req.user
    // để nó chạy tiếp qua thằng controller vì đây middleware
    next()
  } catch (err) {
    next(parseError(err)) // cho chạy xuống dưới cuối để middleware handle lỗi
    // return res
    //   .status(401)
    //   .json({ success: false, message: 'Invalid or expired token' })
  }
}
