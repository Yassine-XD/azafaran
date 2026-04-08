import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  })

  // Postgres unique violation
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      error: { message: 'El registro ya existe', code: 'DUPLICATE_ENTRY' },
    })
  }

  // Postgres foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      error: { message: 'Referencia inválida', code: 'INVALID_REFERENCE' },
    })
  }

  // Postgres invalid datetime / enum value
  if (err.code === '22007' || err.code === '22P02' || err.code === '22008') {
    return res.status(400).json({
      success: false,
      error: { message: 'Valor de campo inválido', code: 'INVALID_FIELD_VALUE' },
    })
  }

  const statusCode = err.statusCode || 500
  const message = statusCode === 500 ? 'Error interno del servidor' : err.message

  res.status(statusCode).json({
    success: false,
    error: { message, code: err.code || 'INTERNAL_ERROR' },
  })
}