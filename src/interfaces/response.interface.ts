export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T | null;
  errors?: Error | null;
  meta?: Meta | null;
}

export interface Error {
  type: string;
  details?: any;
}

export interface Meta {
  total?: number;
  page?: number;
  limit?: number;
  [key: string]: any;
}
