import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { env } from '../config/env'

const ACCESS_SECRET = env.JWT_ACCESS_SECRET
const REFRESH_SECRET = env.JWT_REFRESH_SECRET
const ACCESS_EXPIRES = '15m'
const REFRESH_EXPIRES_DAYS = 30

export interface JwtPayload {
  sub: string      // user id
  role: 'customer' | 'admin'
  email: string
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES })
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, ACCESS_SECRET) as JwtPayload
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex')
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function getRefreshTokenExpiry(): Date {
  const date = new Date()
  date.setDate(date.getDate() + REFRESH_EXPIRES_DAYS)
  return date
}