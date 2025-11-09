import { Application } from 'express';
import authRouters from './authRouters';

const initWebRoutes = (app: Application) => {
  app.use('/api', authRouters);
};

export default initWebRoutes;
