import { z } from "zod";

export const registerTokenSchema = z.object({
  token: z.string().min(1).max(500),
  platform: z.enum(["ios", "android"]),
});

export const unregisterTokenSchema = z.object({
  token: z.string().min(1).max(500),
});

export const updatePreferencesSchema = z.object({
  order_updates: z.boolean().optional(),
  reorder_reminders: z.boolean().optional(),
  promotions: z.boolean().optional(),
  ai_suggestions: z.boolean().optional(),
});
