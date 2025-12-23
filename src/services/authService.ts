import jwt from 'jsonwebtoken'
import { IUser } from '../interfaces'
import User from '../models/user.model'
import { ApiResponder, checkFormatEmail } from '../utils'
import { parseError } from '../utils/parseError.common'
import { comparePassword, hashPassword } from '../utils/utils.common'
import { TOKEN_CONFIG } from '../utils/constants'
import { TokenUtils } from '../utils/token.utils'

const login = (payload: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { ip, user, deviceInfo } = payload
      // Validate
      if (!user || !user.email) {
        reject({
          type: 'ValidationError',
          message: 'Email is required',
        })
      }

      if (!checkFormatEmail(user.email)) {
        reject({
          type: 'ValidationError',
          message: 'Email invalid format',
        })
      }

      if (!user || !user.password) {
        reject({
          type: 'ValidationError',
          message: 'Password is required',
        })
      }
      // find user in database
      const userDB = await User.findOne({
        where: { email: user.email },
      })

      if (!userDB) {
        reject({
          type: 'NotFoundError',
          message: 'User not exist',
        })
      } else {
        const data = userDB.get({ plain: true })
        const pass = await hashPassword(data.password)

        const isPasswordValid = await comparePassword(user.password, pass)
        if (!isPasswordValid) {
          reject({
            type: 'ValidationError',
            message: 'Password not correct',
          })
        }

        // check 2FA
        if (user?.otpEnabled) {
        } else {
          // generate token + refreshToken
          const payloadToken = {
            email: data.email,
            userId: data.id,
          }
          const accessToken = TokenUtils.generateAccessToken(payloadToken)
          resolve(TokenUtils.verifyAccessToken(accessToken))
        }
      }
    } catch (error: any) {
      reject(parseError(error))
    }
  })
}

export default {
  login,
}
