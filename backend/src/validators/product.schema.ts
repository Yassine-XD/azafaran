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

export const updateProductSchema = z.object({
  category_id: z.string().uuid().optional(),

  name: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).optional(),

  description: z.string().nullable().optional(),
  short_desc: z.string().nullable().optional(),

  price_per_kg: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),

  unit_type: z.enum(["kg", "unit", "pack"]).optional(),

  halal_cert_id: z.string().uuid().nullable().optional(),
  halal_cert_body: z.string().max(255).nullable().optional(),

  images: z.array(z.any()).optional(), // ideally refine later
  tags: z.array(z.string()).optional(),

  is_active: z.boolean().optional(),
  is_featured: z.boolean().optional(),

  sort_order: z.number().int().optional(),
});

export type ListProductsInput = z.infer<typeof listProductsSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
