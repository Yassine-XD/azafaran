import { Request, Response, NextFunction } from 'express'

// Wraps async controllers so you never need try/catch in every route
type AsyncFn = (req: Request, res: Response, next: NextFunction) => Promise<any>

export const asyncHandler = (fn: AsyncFn) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}