import { pool } from "../config/database";
import type { ListProductsInput } from "../validators/product.schema";

/**
 * SQL fragment that adds a `default_variant` JSON column to a products query
 * by joining the cheapest active variant. Used by every list endpoint
 * (findAll / findFeatured / findBestsellers / searchProducts) so the
 * frontend can render a per-unit + per-kg price without paying a second
 * round-trip per card. Returns NULL when the product has no active variants.
 */
const DEFAULT_VARIANT_LATERAL = `
  LEFT JOIN LATERAL (
    SELECT json_build_object(
      'id', pv.id,
      'label', pv.label,
      'label_i18n', pv.label_i18n,
      'price', pv.price,
      'weight_grams', pv.weight_grams,
      'stock_qty', pv.stock_qty,
      'sort_order', pv.sort_order
    ) AS data
    FROM product_variants pv
    WHERE pv.product_id = p.id AND pv.is_active = true
    ORDER BY pv.price ASC, pv.sort_order ASC
    LIMIT 1
  ) dv ON TRUE
`;

export interface ProductRow {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  short_desc: string | null;
  price_per_kg: string;
  unit_type: "kg" | "unit" | "pack";
  halal_cert_id: string | null;
  halal_cert_body: string | null;
  images: any[];
  tags: string[];
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
  // i18n translation maps
  name_i18n: Record<string, string> | null;
  description_i18n: Record<string, string> | null;
  short_desc_i18n: Record<string, string> | null;
  // Joined fields
  category_name?: string;
  category_slug?: string;
}

export interface VariantRow {
  id: string;
  product_id: string;
  label: string;
  label_i18n: Record<string, string> | null;
  weight_grams: number;
  price: string;
  stock_qty: number;
  sku: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface PackItemRow {
  id: string;
  pack_id: string;
  product_id: string;
  quantity: number;
  custom_label: string | null;
  sort_order: number;
  created_at: Date;
  product_name: string;
  product_images: any[];
  product_price_per_kg: string;
  product_category_name: string;
}

export interface ProductWithVariants extends ProductRow {
  variants: VariantRow[];
  pack_items?: PackItemRow[];
  category_name: string;
  category_slug: string;
}

export const productRepository = {
  async findAll(
    input: ListProductsInput,
  ): Promise<{ rows: ProductRow[]; total: number }> {
    const conditions: string[] = ["p.is_active = true"];
    const values: any[] = [];
    let idx = 1;

    if (input.category) {
      conditions.push(`c.slug = $${idx++}`);
      values.push(input.category);
    }

    if (input.in_stock) {
      conditions.push(
        `EXISTS (
          SELECT 1 FROM product_variants v
          WHERE v.product_id = p.id AND v.stock_qty > 0 AND v.is_active = true
        )`,
      );
    }

    if (input.search) {
      conditions.push(`(p.name ILIKE $${idx} OR p.description ILIKE $${idx})`);
      values.push(`%${input.search}%`);
      idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    // Sort column mapping
    const sortMap: Record<string, string> = {
      price: "p.price_per_kg",
      popularity: "p.sort_order",
      date: "p.created_at",
      name: "p.name",
    };
    const sortCol = sortMap[input.sort] || "p.created_at";
    const sortDir = input.order.toUpperCase();

    const offset = (input.page - 1) * input.limit;

    // Count query
    const countRes = await pool.query(
      `SELECT COUNT(*) FROM products p
       JOIN categories c ON c.id = p.category_id
       ${where}`,
      values,
    );
    const total = parseInt(countRes.rows[0].count, 10);

    // Data query
    const dataValues = [...values, input.limit, offset];
    const { rows } = await pool.query(
      `SELECT
         p.*,
         c.name AS category_name,
         c.slug AS category_slug,
         dv.data AS default_variant
       FROM products p
       JOIN categories c ON c.id = p.category_id
       ${DEFAULT_VARIANT_LATERAL}
       ${where}
       ORDER BY ${sortCol} ${sortDir}
       LIMIT $${idx} OFFSET $${idx + 1}`,
      dataValues,
    );

    return { rows, total };
  },

  async findById(id: string): Promise<ProductWithVariants | null> {
    // Fetch product
    const { rows: productRows } = await pool.query(
      `SELECT
         p.*,
         c.name AS category_name,
         c.slug AS category_slug
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE p.id = $1`,
      [id],
    );

    if (!productRows[0]) return null;

    // Fetch variants
    const { rows: variantRows } = await pool.query(
      `SELECT * FROM product_variants
       WHERE product_id = $1 AND is_active = true
       ORDER BY sort_order ASC, weight_grams ASC`,
      [id],
    );

    const product: ProductWithVariants = { ...productRows[0], variants: variantRows };

    // Load pack items for pack products
    if (product.unit_type === "pack") {
      const { rows: packItemRows } = await pool.query(
        `SELECT pi.*, p.name AS product_name, p.images AS product_images,
                p.price_per_kg AS product_price_per_kg, c.name AS product_category_name
         FROM pack_items pi
         JOIN products p ON p.id = pi.product_id
         JOIN categories c ON c.id = p.category_id
         WHERE pi.pack_id = $1
         ORDER BY pi.sort_order ASC, pi.created_at ASC`,
        [id],
      );
      product.pack_items = packItemRows;
    }

    return product;
  },

  async updateProduct(
  id: string,
  data: Partial<Omit<ProductRow, "id" | "created_at" | "updated_at">>,
): Promise<ProductWithVariants | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  // Dynamically build SET clause
  for (const [key, value] of Object.entries(data)) {
    fields.push(`${key} = $${idx++}`);
    values.push(value);
  }

  if (fields.length === 0) {
    // Nothing to update → just return current product
    return productRepository.findById(id);
  }

  // Always update timestamp
  fields.push(`updated_at = NOW()`);

  values.push(id);

  const query = `
    UPDATE products
    SET ${fields.join(", ")}
    WHERE id = $${idx}
    RETURNING id
  `;

  const { rows } = await pool.query(query, values);

  if (!rows[0]) return null;

  // Reuse existing logic (VERY IMPORTANT → avoids duplication)
  return productRepository.findById(rows[0].id);
},

  async findBySlug(slug: string): Promise<ProductWithVariants | null> {
    const { rows } = await pool.query(
      "SELECT id FROM products WHERE slug = $1 AND is_active = true",
      [slug],
    );
    if (!rows[0]) return null;
    return productRepository.findById(rows[0].id);
  },

  async findFeatured(): Promise<ProductRow[]> {
    const { rows } = await pool.query(
      `SELECT
         p.*,
         c.name AS category_name,
         c.slug AS category_slug,
         dv.data AS default_variant
       FROM products p
       JOIN categories c ON c.id = p.category_id
       ${DEFAULT_VARIANT_LATERAL}
       WHERE p.is_active = true AND p.is_featured = true
       ORDER BY p.sort_order ASC
       LIMIT 10`,
    );
    return rows;
  },

  async findBestsellers(): Promise<ProductRow[]> {
    // Products with most order_items
    const { rows } = await pool.query(
      `SELECT
         p.*,
         c.name AS category_name,
         c.slug AS category_slug,
         dv.data AS default_variant,
         COUNT(oi.id) AS order_count
       FROM products p
       JOIN categories c ON c.id = p.category_id
       ${DEFAULT_VARIANT_LATERAL}
       LEFT JOIN product_variants pv ON pv.product_id = p.id
       LEFT JOIN order_items oi ON oi.variant_id = pv.id
       WHERE p.is_active = true
       GROUP BY p.id, c.name, c.slug, dv.data
       ORDER BY order_count DESC
       LIMIT 10`,
    );
    return rows;
  },

  async findByCategory(
    categorySlug: string,
    page: number,
    limit: number,
  ): Promise<{ rows: ProductRow[]; total: number }> {
    return productRepository.findAll({
      category: categorySlug,
      page,
      limit,
      sort: "date",
      order: "desc",
    });
  },

  async findVariantById(variantId: string): Promise<VariantRow | null> {
    const { rows } = await pool.query(
      "SELECT * FROM product_variants WHERE id = $1 AND is_active = true",
      [variantId],
    );
    return rows[0] || null;
  },

  async findVariantsByProductId(productId: string): Promise<VariantRow[]> {
    const { rows } = await pool.query(
      `SELECT * FROM product_variants
       WHERE product_id = $1 AND is_active = true
       ORDER BY sort_order ASC, weight_grams ASC`,
      [productId],
    );
    return rows;
  },

  async searchProducts(query: string, limit = 10): Promise<ProductRow[]> {
    const { rows } = await pool.query(
      `SELECT
         p.*,
         c.name AS category_name,
         c.slug AS category_slug,
         dv.data AS default_variant,
         ts_rank(
           to_tsvector('spanish', p.name || ' ' || COALESCE(p.description, '')),
           plainto_tsquery('spanish', $1)
         ) AS rank
       FROM products p
       JOIN categories c ON c.id = p.category_id
       ${DEFAULT_VARIANT_LATERAL}
       WHERE p.is_active = true
         AND to_tsvector('spanish', p.name || ' ' || COALESCE(p.description, ''))
             @@ plainto_tsquery('spanish', $1)
       ORDER BY rank DESC
       LIMIT $2`,
      [query, limit],
    );

    // Fallback to ILIKE if FTS returns nothing
    if (rows.length === 0) {
      const { rows: fallback } = await pool.query(
        `SELECT
           p.*,
           c.name AS category_name,
           c.slug AS category_slug,
           dv.data AS default_variant
         FROM products p
         JOIN categories c ON c.id = p.category_id
         ${DEFAULT_VARIANT_LATERAL}
         WHERE p.is_active = true
           AND (p.name ILIKE $1 OR p.description ILIKE $1)
         ORDER BY p.sort_order ASC
         LIMIT $2`,
        [`%${query}%`, limit],
      );
      return fallback;
    }

    return rows;
  },
};
