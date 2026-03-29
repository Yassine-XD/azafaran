import { Request, Response } from 'express'
import { authService } from '../services/auth.service'
import { asyncHandler } from '../utils/asyncHandler'
import { success } from '../utils/apiResponse'

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const deviceInfo = {
      platform: req.headers['x-platform'],
      userAgent: req.headers['user-agent'],
    }
    const result = await authService.register(req.body, deviceInfo)
    return success(res, result, 201)
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const deviceInfo = {
      platform: req.headers['x-platform'],
      userAgent: req.headers['user-agent'],
    }
    const result = await authService.login(req.body, deviceInfo)
    return success(res, result)
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body
    const result = await authService.refresh(refreshToken)
    return success(res, result)
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body
    await authService.logout(refreshToken)
    return success(res, { message: 'Sesión cerrada correctamente' })
  }),

  logoutAll: asyncHandler(async (req: Request, res: Response) => {
    await authService.logoutAll(req.user!.sub)
    return success(res, { message: 'Todas las sesiones cerradas' })
  }),
}