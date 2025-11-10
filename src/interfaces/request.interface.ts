import { Request } from 'express';
import { IUser } from './auth.interface';

export interface AuthRequest extends Request {
  user?: IUser; // user được inject sau khi verify token
}
