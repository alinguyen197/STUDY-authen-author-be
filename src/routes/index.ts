import { Application } from 'express'
import authRouters from './authRouters'
import userRouters from './userRouters'

const initWebRoutes = (app: Application) => {
  app.use('/api/auth', authRouters)
  app.use('/api/user', userRouters)
}

export default initWebRoutes
