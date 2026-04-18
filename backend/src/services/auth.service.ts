import { userRepository } from '../repositories/user.repository'
import { emailService } from './email.service'
import { logger } from '../utils/logger'
import { hashPassword, comparePassword } from '../utils/hash'
import {
  signAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  getRefreshTokenExpiry,
} from '../utils/jwt'
import type { RegisterInput, LoginInput } from '../validators/auth.schema'

function createAppError(message: string, statusCode: number, code: string) {
  const err: any = new Error(message)
  err.statusCode = statusCode
  err.code = code
  return err
}

export const authService = {
  async register(input: RegisterInput, deviceInfo?: object) {
    // Check duplicate email
    const existing = await userRepository.findByEmail(input.email)
    if (existing) {
      throw createAppError('El email ya está registrado', 409, 'EMAIL_EXISTS')
    }

    // Hash password
    const password_hash = await hashPassword(input.password)

    // Create user
    const user = await userRepository.create({
      first_name: input.first_name,
      last_name: input.last_name,
      email: input.email,
      password_hash,
      phone: input.phone,
      preferred_lang: input.preferred_lang,
    })

    // Send welcome email (fire-and-forget)
    emailService.sendWelcomeEmail(user.id).catch((err) =>
      logger.error(`Failed to send welcome email: ${err.message}`),
    )

    // Generate tokens
    return authService._issueTokens(user, deviceInfo)
  },

  async login(input: LoginInput, deviceInfo?: object) {
    const user = await userRepository.findByEmail(input.email)

    // Generic error — never reveal if email exists
    if (!user) {
      throw createAppError('Credenciales incorrectas', 401, 'INVALID_CREDENTIALS')
    }

    const valid = await comparePassword(input.password, user.password_hash)
    if (!valid) {
      throw createAppError('Credenciales incorrectas', 401, 'INVALID_CREDENTIALS')
    }

    return authService._issueTokens(user, deviceInfo)
  },

  async refresh(rawRefreshToken: string, deviceInfo?: object) {
    const tokenHash = hashRefreshToken(rawRefreshToken)
    const stored = await userRepository.findRefreshToken(tokenHash)

    if (!stored) {
      // Token not found or expired
      // Could be reuse attack — if you want, revoke all tokens for this user here
      throw createAppError('Token inválido o expirado', 401, 'INVALID_REFRESH_TOKEN')
    }

    // Rotate — delete old token
    await userRepository.deleteRefreshToken(tokenHash)

    // Fetch user
    const user = await userRepository.findById(stored.user_id)
    if (!user) {
      throw createAppError('Usuario no encontrado', 401, 'USER_NOT_FOUND')
    }

    // Issue new tokens
    return authService._issueTokens(user, deviceInfo)
  },

  async logout(rawRefreshToken: string) {
    const tokenHash = hashRefreshToken(rawRefreshToken)
    await userRepository.deleteRefreshToken(tokenHash)
  },

  async logoutAll(userId: string) {
    await userRepository.deleteAllRefreshTokens(userId)
  },

  // Internal helper — issues both tokens, saves refresh to DB
  async _issueTokens(user: any, deviceInfo?: object) {
    const accessToken = signAccessToken({
      sub: user.id,
      role: user.role,
      email: user.email,
    })

    const rawRefreshToken = generateRefreshToken()
    const tokenHash = hashRefreshToken(rawRefreshToken)

    await userRepository.saveRefreshToken({
      userId: user.id,
      tokenHash,
      deviceInfo,
      expiresAt: getRefreshTokenExpiry(),
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        preferred_lang: user.preferred_lang,
      },
      accessToken,
      refreshToken: rawRefreshToken,
    }
  },
}