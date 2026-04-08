import { pool } from "../config/database";

export const promotionRepository = {
  async findActivePromotions() {
    const { rows } = await pool.query(
      `SELECT
         p.*,
         pr.name AS product_name,
         pr.slug AS product_slug,
         c.name AS category_name,
         c.slug AS category_slug
       FROM promotions p
       LEFT JOIN products pr ON pr.id = p.product_id
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.is_active = true
         AND p.starts_at <= NOW()
         AND (p.ends_at IS NULL OR p.ends_at > NOW())
       ORDER BY p.priority DESC, p.created_at DESC`,
    );
    return rows;
  },

  async findHomePromotions() {
    const { rows } = await pool.query(
      `SELECT
         p.*,
         pr.name AS product_name,
         pr.slug AS product_slug,
         c.name AS category_name,
         c.slug AS category_slug
       FROM promotions p
       LEFT JOIN products pr ON pr.id = p.product_id
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.is_active = true
         AND p.show_on_home = true
         AND p.starts_at <= NOW()
         AND (p.ends_at IS NULL OR p.ends_at > NOW())
       ORDER BY p.priority DESC
       LIMIT 10`,
    );
    return rows;
  },

  async findActiveBanners() {
    const { rows } = await pool.query(
      `SELECT * FROM banners
       WHERE is_active = true
         AND (starts_at IS NULL OR starts_at <= NOW())
         AND (ends_at IS NULL OR ends_at > NOW())
       ORDER BY display_order ASC`,
    );
    return rows;
  },

  async findById(id: string) {
    const { rows } = await pool.query(
      "SELECT * FROM promotions WHERE id = $1",
      [id],
    );
    return rows[0] || null;
  },

  async findBannerById(id: string) {
    const { rows } = await pool.query(
      "SELECT * FROM banners WHERE id = $1",
      [id],
    );
    return rows[0] || null;
  },
};
