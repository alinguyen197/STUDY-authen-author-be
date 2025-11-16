import { Request, Response, NextFunction } from 'express';
import { ApiResponder } from '../utils/response.common';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  switch (err.type) {
    case 'ValidationError':
      return ApiResponder.validationError(res, err.details);

    case 'NotFoundError':
      return ApiResponder.notFound(res, err.message);

    case 'AuthError':
      return ApiResponder.unauthorized(res, err.message);

    case 'DatabaseError':
      return ApiResponder.dbError(res, err.details);

    default:
      return ApiResponder.error(res, err, 'Unexpected error', 500);
  }
};
