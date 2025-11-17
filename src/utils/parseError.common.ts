import { TokenExpiredError } from 'jsonwebtoken'
import {
  DatabaseError,
  UniqueConstraintError,
  ValidationError,
} from 'sequelize'

export const parseError = (error: any) => {
  if (!error)
    return { type: 'UnknownError', message: 'Unknown error', details: null }

  if (
    error instanceof ValidationError ||
    error.name === 'SequelizeValidationError'
  ) {
    return {
      type: 'ValidationError',
      message: error.message,
      details: error.errors.map((e: any) => ({
        path: e.path,
        message: e.message,
        value: e.value,
      })),
    }
  }

  if (
    error instanceof UniqueConstraintError ||
    error.name === 'SequelizeUniqueConstraintError'
  ) {
    return {
      type: 'UniqueConstraintError',
      message: error.message,
      details: error.errors.map((e: any) => ({
        path: e.path,
        message: e.message,
        value: e.value,
      })),
    }
  }

  if (
    error instanceof DatabaseError ||
    error.name === 'SequelizeDatabaseError'
  ) {
    return {
      type: 'DatabaseError',
      message: error.message,
      details: error.parent,
    }
  }

  if (
    error instanceof TokenExpiredError ||
    error.name === 'TokenExpiredError'
  ) {
    return {
      type: 'TokenExpiredError',
      message: error.message,
      expiredAt: error.expiredAt,
    }
  }

  if (error instanceof Error) {
    return { type: 'Error', message: error.message, details: null }
  }

  // Fallback
  return { type: 'UnknownError', message: String(error), details: error }
}
