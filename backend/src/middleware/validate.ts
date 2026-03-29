import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'
import { error } from '../utils/apiResponse'

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const messages = result.error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      }))
      return res.status(400).json({
        success: false,
        error: { message: 'Datos inválidos', code: 'VALIDATION_ERROR', fields: messages },
      })
    }
    req.body = result.data
    next()
  }
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params)
    if (!result.success) {
      return error(res, 'Parámetros inválidos', 400, 'INVALID_PARAMS')
    }
    req.params = result.data
    next()
  }
}