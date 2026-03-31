// Extends Express Request so req.user is typed everywhere
import { JwtPayload } from '../utils/jwt'

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

// Fix Express 5 params type — route params are always single strings
declare module 'express' {
  interface Request {
    params: Record<string, string>
  }
}
