import { z } from "zod";

export const registerSchema = z.object({
  first_name: z.string().min(2).max(100),
  last_name: z.string().min(2).max(100),
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[0-9]/, "Debe contener al menos un número"),
  phone: z.string().optional(),
  preferred_lang: z.enum(["es", "ca", "en"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

// Reset tokens are 32 random bytes hex-encoded => 64 chars, [a-f0-9].
// Rejecting anything shorter/non-hex removes a brute-force surface and
// catches trivially malformed inputs before hitting the DB.
export const resetPasswordSchema = z.object({
  token: z
    .string()
    .length(64, "Token inválido")
    .regex(/^[a-f0-9]+$/i, "Token inválido"),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[0-9]/, "Debe contener al menos un número"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
