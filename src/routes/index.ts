import { Application } from 'express';
import homeRouters from './homeRouters';

const initWebRoutes = (app: Application) => {
  app.use('/', homeRouters);
};

export default initWebRoutes;
