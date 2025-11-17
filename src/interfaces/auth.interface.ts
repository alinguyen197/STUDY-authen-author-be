export interface IUser {
  email: string
  password?: string
}

interface JwtPayload {
  id: number
  email: string
}
interface AuthRequest extends Request {
  user?: JwtPayload
}
