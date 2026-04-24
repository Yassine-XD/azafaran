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

    const issued = await authService._issueTokens(user, deviceInfo)
    return issued.payload
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

    const issued = await authService._issueTokens(user, deviceInfo)
    return issued.payload
  },

  async refresh(rawRefreshToken: string, deviceInfo?: object) {
    const tokenHash = hashRefreshToken(rawRefreshToken)
    const stored = await userRepository.findRefreshToken(tokenHash)

    if (!stored) {
      throw createAppError('Token inválido o expirado', 401, 'INVALID_REFRESH_TOKEN')
    }

    // Reuse-attack detection: the token exists but was already rotated.
    // That means someone is replaying a stolen token. Burn the entire family
    // so both the attacker and the legitimate client are forced to re-auth.
    if (stored.revoked_at !== null) {
      logger.warn(
        `Refresh-token reuse detected for user ${stored.user_id} ` +
          `(family ${stored.family_id}). Revoking family.`,
      )
      await userRepository.revokeRefreshTokenFamily(stored.family_id)
      throw createAppError(
        'Token inválido o expirado',
        401,
        'REFRESH_TOKEN_REUSED',
      )
    }

    if (stored.expires_at.getTime() <= Date.now()) {
      throw createAppError('Token inválido o expirado', 401, 'INVALID_REFRESH_TOKEN')
    }

    const user = await userRepository.findById(stored.user_id)
    if (!user) {
      throw createAppError('Usuario no encontrado', 401, 'USER_NOT_FOUND')
    }

    // Issue new tokens within the same family, then mark the old row as
    // rotated (not deleted) so a replay of the old token can be detected.
    const issued = await authService._issueTokens(user, deviceInfo, stored.family_id)
    await userRepository.markRefreshTokenRotated(stored.id, issued._refreshTokenId)
    return issued.payload
  },

  async logout(rawRefreshToken: string) {
    const tokenHash = hashRefreshToken(rawRefreshToken)
    await userRepository.deleteRefreshToken(tokenHash)
  },

  async logoutAll(userId: string) {
    await userRepository.deleteAllRefreshTokens(userId)
  },

  // Internal helper — issues both tokens, saves refresh to DB.
  // `_refreshTokenId` is consumed by `refresh()` to link parent -> child;
  // controllers send only `payload` back to the client.
  async _issueTokens(user: any, deviceInfo?: object, familyId?: string) {
    const accessToken = signAccessToken({
      sub: user.id,
      role: user.role,
      email: user.email,
    })

    const rawRefreshToken = generateRefreshToken()
    const tokenHash = hashRefreshToken(rawRefreshToken)

    const saved = await userRepository.saveRefreshToken({
      userId: user.id,
      tokenHash,
      deviceInfo,
      expiresAt: getRefreshTokenExpiry(),
      familyId,
    })

    const payload = {
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

    return { payload, _refreshTokenId: saved.id }
  },
}