// Extends Express Request so req.user is typed everywhere
import { JwtPayload } from '../utils/jwt'

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}