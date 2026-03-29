import { pool } from "../config/database";

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export const categoryRepository = {
  async findAll(): Promise<CategoryRow[]> {
    const { rows } = await pool.query(
      `SELECT * FROM categories
       WHERE is_active = true
       ORDER BY display_order ASC`,
    );
    return rows;
  },

  async findBySlug(slug: string): Promise<CategoryRow | null> {
    const { rows } = await pool.query(
      "SELECT * FROM categories WHERE slug = $1 AND is_active = true",
      [slug],
    );
    return rows[0] || null;
  },

  async findById(id: string): Promise<CategoryRow | null> {
    const { rows } = await pool.query(
      "SELECT * FROM categories WHERE id = $1",
      [id],
    );
    return rows[0] || null;
  },
};
