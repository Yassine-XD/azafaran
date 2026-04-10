import { z } from "zod";

export const errorReportSchema = z.object({
  message: z.string().min(1).max(2000),
  stack: z.string().max(5000).optional(),
  url: z.string().max(500).optional(),
  component: z.string().max(200).optional(),
  userId: z.string().uuid().optional(),
});

export type ErrorReportInput = z.infer<typeof errorReportSchema>;
