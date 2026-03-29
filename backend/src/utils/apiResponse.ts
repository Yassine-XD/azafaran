import { Response } from 'express'

export function success(res: Response, data: any, statusCode = 200, meta?: any) {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(meta && { meta }),
  })
}

export function error(res: Response, message: string, statusCode = 400, code?: string) {
  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(code && { code }),
    },
  })
}