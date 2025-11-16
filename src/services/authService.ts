import bcrypt from 'bcrypt';
import { IUser } from '../interfaces';
import { User } from '../models/user.model';
import { ApiResponder } from '../utils/response.common';
import { checkFormatEmail } from '../utils';
import { parseError } from '../utils/parseError';

const handleLogin = (data: IUser) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Validate
      if (!data || !data.email) {
        reject({
          type: 'ValidationError',
          details: { email: 'Email is required' },
        });
      }

      if (!checkFormatEmail(data.email)) {
        reject({
          type: 'NotFoundError',
          message: 'Email is not in the correct format',
        });
      }

      // if (!data || !data.password) {
      //   return ApiResponder.validationError(res, {
      //     password: 'Password is required',
      //   });
      // }
      const user = await User.findOne({
        where: { email: data.email },
        attributes: { exclude: ['password'] },
      });
      user?.get({ plain: true });
      resolve(user);
    } catch (error: any) {
      reject(parseError(error));
    }
  });
};

const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

const comparePassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

const checkEmailExists = async (email: string) => {
  try {
  } catch (error) {}
};

export default {
  handleLogin,
  hashPassword,
  comparePassword,
  checkEmailExists,
};
