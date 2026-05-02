import { Request, Response, NextFunction } from 'express'
import { ApiResponder } from '../utils/response.common'
import { EHttpStatuses } from '../utils/constants'
import { parseError } from '../utils/parseError.common'
import {
  DatabaseError,
  UniqueConstraintError,
  ValidationError as SequelizeValidationError,
} from 'sequelize'
import { TokenExpiredError } from 'jsonwebtoken'

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Parse library errors (Sequelize, JWT) first
  if (
    err instanceof SequelizeValidationError ||
    err instanceof UniqueConstraintError ||
    err instanceof DatabaseError ||
    err instanceof TokenExpiredError ||
    err.name === 'SequelizeValidationError' ||
    err.name === 'SequelizeUniqueConstraintError' ||
    err.name === 'SequelizeDatabaseError' ||
    err.name === 'TokenExpiredError'
  ) {
    err = parseError(err)
  }

  switch (err.type) {
    case 'ValidationError':
      return ApiResponder.validationError(res, err)

    case 'NotFoundError':
      return ApiResponder.notFound(res, err.message)

    case 'AuthError':
      return ApiResponder.unauthorized(res, err.message)

    case 'DatabaseError':
      return ApiResponder.dbError(res, err)

    case 'AuthorizationError':
      return ApiResponder.forbidden(res, err.message)

    case 'TokenExpiredError':
      return ApiResponder.error(
        res,
        err,
        'Unauthorized',
        EHttpStatuses.Unauthorized
      )

    case 'UniqueConstraintError':
      return ApiResponder.validationError(res, err)

    default:
      return ApiResponder.error(
        res,
        err,
        'Unexpected error',
        EHttpStatuses.InternalServerError
      )
  }
}
