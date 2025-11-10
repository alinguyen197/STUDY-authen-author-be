import { IUser } from '@/interfaces';

// thêm 1 interface vào interface của thư viện , setup global
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
