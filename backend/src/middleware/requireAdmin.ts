import { Request, Response, NextFunction } from 'express'
import { error } from '../utils/apiResponse'

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return error(res, 'Acceso denegado', 403, 'FORBIDDEN')
  }
  next()
}