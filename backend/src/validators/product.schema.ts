import { z } from "zod";

export const listProductsSchema = z.object({
  category: z.string().optional(),
  search: z.string().max(100).optional(),
  sort: z.enum(["price", "popularity", "date", "name"]).default("date"),
  order: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  in_stock: z.coerce.boolean().optional(),
});

export const productIdSchema = z.object({
  id: z.string().uuid("ID de producto inválido"),
});

export type ListProductsInput = z.infer<typeof listProductsSchema>;
