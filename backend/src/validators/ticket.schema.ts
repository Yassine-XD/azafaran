import { z } from "zod";

export const TICKET_CATEGORIES = [
  "order",
  "payment",
  "delivery",
  "product",
  "account",
  "other",
] as const;

export const TICKET_STATUSES = [
  "open",
  "in_progress",
  "waiting_user",
  "resolved",
  "closed",
] as const;

export const TICKET_PRIORITIES = ["low", "normal", "high", "urgent"] as const;

export const createTicketSchema = z.object({
  subject: z.string().trim().min(3).max(200),
  category: z.enum(TICKET_CATEGORIES).default("other"),
  body: z.string().trim().min(1).max(5000),
});

export const createMessageSchema = z.object({
  body: z.string().trim().min(1).max(5000),
});

export const adminUpdateTicketSchema = z
  .object({
    status: z.enum(TICKET_STATUSES).optional(),
    priority: z.enum(TICKET_PRIORITIES).optional(),
    assigned_to: z.string().uuid().nullable().optional(),
  })
  .refine(
    (v) =>
      v.status !== undefined ||
      v.priority !== undefined ||
      v.assigned_to !== undefined,
    { message: "Debe incluir al menos un campo" },
  );

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type AdminUpdateTicketInput = z.infer<typeof adminUpdateTicketSchema>;
