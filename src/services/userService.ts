import User from '../models/user.model'
import { parseError } from '../utils'

const getAllUsers = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const users = await User.findAll()

      resolve(users)
    } catch (error) {
      reject(parseError(error))
    }
  })
}

export default { getAllUsers }
