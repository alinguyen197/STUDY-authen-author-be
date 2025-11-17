import { IUser } from '../interfaces'
import { User } from '../models/user.model'
import { ApiResponder } from '../utils/response.common'
import { checkFormatEmail } from '../utils'
import { parseError } from '../utils/parseError.common'
import { comparePassword, hashPassword } from '../utils/utils.common'
import jwt from 'jsonwebtoken'

const handleLogin = (data: IUser) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Validate
      if (!data || !data.email) {
        reject({
          type: 'ValidationError',
          details: { email: 'Email is required' },
        })
      }

      if (!checkFormatEmail(data.email)) {
        reject({
          type: 'ValidationError',
          message: 'Email invalid format',
        })
      }

      if (!data || !data.password) {
        reject({
          type: 'ValidationError',
          details: { password: 'Password is required' },
        })
      }

      const user = await User.findOne({
        where: { email: data.email },
      })

      if (!user) {
        reject({
          type: 'NotFoundError',
          message: 'User not exist',
        })
      }

      const checkPassword = await comparePassword(
        data.password ?? '',
        await hashPassword(user?.password ?? '')
      )
      if (!checkPassword) {
        reject({
          type: 'AuthError',
          message: 'Invalid password',
        })
      }
      const JWT_KEY = process.env.JWT_KEY || 'your_secret_key'
      const payload = { id: user?.id, email: user?.email }
      const token = jwt.sign(payload, JWT_KEY, {
        expiresIn: '30s',
      })

      resolve({
        payload,
        token,
      })
    } catch (error: any) {
      reject(parseError(error))
    }
  })
}

const checkEmailExists = async (email: string) => {
  try {
  } catch (error) {}
}

export default {
  handleLogin,
  checkEmailExists,
}
