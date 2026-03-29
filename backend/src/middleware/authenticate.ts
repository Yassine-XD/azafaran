import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt'
import { error } from '../utils/apiResponse'

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'Token de acceso requerido', 401, 'UNAUTHORIZED')
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = verifyAccessToken(token)
    req.user = payload
    next()
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Token expirado', 401, 'TOKEN_EXPIRED')
    }
    return error(res, 'Token inválido', 401, 'INVALID_TOKEN')
  }
}