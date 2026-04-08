import { z } from "zod";

export const updateProfileSchema = z.object({
  first_name: z.string().min(2).max(100).optional(),
  last_name: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  family_size: z.number().int().min(1).max(20).optional().nullable(),
  preferred_lang: z.enum(["es", "ca", "en"]).optional(),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional().nullable(),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format: YYYY-MM-DD").optional().nullable(),
  accepts_terms: z.boolean().optional(),
  accepts_marketing: z.boolean().optional(),
});

export const createAddressSchema = z.object({
  label: z.string().min(1).max(50).default("Casa"),
  street: z.string().min(5).max(255),
  city: z.string().min(2).max(100),
  postcode: z.string().min(4).max(10),
  province: z.string().min(2).max(100).default("Barcelona"),
  country: z.string().length(2).default("ES"),
  instructions: z.string().max(500).optional().nullable(),
  is_default: z.boolean().default(false),
});

export const updateAddressSchema = createAddressSchema.partial();

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
