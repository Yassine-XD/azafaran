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
  email_notifications: z.boolean().optional(),
});

// ─── Notification deep-link payload ────────────────────
// Discriminated by `type`; one shape on the wire and on the device.
export const ALLOWED_NOTIFICATION_SCREENS = [
  "index",
  "categories",
  "deals",
  "orders",
  "profile",
] as const;

export const notificationPayloadSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("none") }),
  z.object({
    type: z.literal("screen"),
    screen: z.enum(ALLOWED_NOTIFICATION_SCREENS),
  }),
  z.object({
    type: z.literal("product"),
    productId: z.string().uuid(),
  }),
  z.object({
    type: z.literal("coupon"),
    promoCode: z.string().min(1).max(50),
  }),
  z.object({
    type: z.literal("order"),
    orderId: z.string().uuid(),
  }),
]);

export const adminSendNotificationSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(2000),
  type: z.enum(["push", "email", "sms", "campaign", "reorder", "flash"]).optional(),
  target: z.enum(["all", "segment", "user"]).default("all"),
  target_user_ids: z.array(z.string().uuid()).optional(),
  image_url: z.string().url().max(500).optional().or(z.literal("").transform(() => undefined)),
  scheduled_at: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  payload: notificationPayloadSchema,
});

export type AdminSendNotificationInput = z.infer<typeof adminSendNotificationSchema>;
