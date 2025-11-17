import { Response } from 'express';
import { ApiResponse } from '../interfaces/response.interface';

export class ApiResponder {
  static success<T>(
    res: Response,
    data: T,
    message = 'Success',
    statusCode = 200,
    meta?: ApiResponse['meta']
  ) {
    const response: ApiResponse<T> = {
      success: true,
      statusCode,
      message,
      data,
      meta: meta || null,
    };
    return res.status(statusCode).json(response);
  }

  static error(res: Response, error: any, message = 'Error', statusCode = 500) {
    // kiểm tra đang ở môi trường nào để hạn chế quăng lỗi trên môi trường production
    const isDev = process.env.NODE_ENV !== 'production';

    const response: ApiResponse = {
      success: false,
      statusCode,
      message,
      data: null,
      errors: isDev ? error : undefined,
    };

    return res.status(statusCode).json(response);
  }

  static validationError(res: Response, details: any) {
    return this.error(res, details, 'Validation error', 400);
  }

  static notFound(res: Response, message = 'Not found') {
    return this.error(res, null, message, 404);
  }

  static unauthorized(res: Response, message = 'Unauthorized') {
    return this.error(res, null, message, 401);
  }

  static forbidden(res: Response, message = 'Forbidden') {
    return this.error(res, null, message, 403);
  }

  static dbError(res: Response, error: any) {
    return this.error(res, error, 'Database error', 500);
  }

  static pagination<T>(
    res: Response,
    data: T,
    page: number,
    limit: number,
    total: number,
    message = 'Success'
  ) {
    return this.success(res, data, message, 200, {
      page,
      limit,
      total,
    });
  }
}
