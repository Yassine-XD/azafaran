/**
 * Promotion Service
 */

import { pool } from "../config/database";
import { v4 as uuidv4 } from "uuid";
import { AppError } from "../types/api";
import { logger } from "../utils/logger";

export const promotionService = {
  async getAllPromotions(filters: { page: number; limit: number }) {
    const { page, limit } = filters;
    const offset = (page - 1) * limit;

    const [dataRes, countRes] = await Promise.all([
      pool.query(
        `SELECT * FROM promotions
         WHERE is_active = true
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset],
      ),
      pool.query("SELECT COUNT(*) FROM promotions WHERE is_active = true"),
    ]);

    const total = parseInt(countRes.rows[0].count, 10);

    return {
      data: dataRes.rows,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  },

  async getPromotionById(id: string) {
    const { rows } = await pool.query(
      "SELECT * FROM promotions WHERE id = $1",
      [id],
    );
    if (!rows[0]) throw new AppError("Promoción no encontrada", 404, "PROMOTION_NOT_FOUND");
    return rows[0];
  },

  async validatePromoCode(code: string, _userId?: string) {
    const { rows } = await pool.query(
      `SELECT * FROM promo_codes
       WHERE code = $1 AND is_active = true
       AND (expires_at IS NULL OR expires_at > NOW())`,
      [code.toUpperCase()],
    );

    if (!rows[0]) throw new AppError("Código promocional inválido", 400, "INVALID_PROMO_CODE");
    return rows[0];
  },

  async createPromotion(data: any) {
    const { rows } = await pool.query(
      `INSERT INTO promotions (id, title, description, discount_type, discount_value, min_purchase, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING *`,
      [uuidv4(), data.title, data.description, data.discount_type, data.discount_value, data.min_purchase || 0],
    );
    logger.info(`Promotion created: ${rows[0].id}`);
    return rows[0];
  },

  async updatePromotion(id: string, data: any) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, value] of Object.entries(data)) {
      fields.push(`${key} = $${idx++}`);
      values.push(value);
    }

    if (fields.length === 0) return promotionService.getPromotionById(id);

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE promotions SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values,
    );
    if (!rows[0]) throw new AppError("Promoción no encontrada", 404, "PROMOTION_NOT_FOUND");
    logger.info(`Promotion updated: ${id}`);
    return rows[0];
  },

  async deletePromotion(id: string) {
    const { rowCount } = await pool.query(
      "UPDATE promotions SET is_active = false WHERE id = $1",
      [id],
    );
    if (!rowCount) throw new AppError("Promoción no encontrada", 404, "PROMOTION_NOT_FOUND");
    logger.info(`Promotion deleted: ${id}`);
  },
};
