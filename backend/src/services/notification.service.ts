/**
 * Notification Service
 */

import { pool } from "../config/database";
import { v4 as uuidv4 } from "uuid";
import { AppError } from "../types/api";
import { logger } from "../utils/logger";

export const notificationService = {
  async getUserNotifications(userId: string, filters: { page: number; limit: number }) {
    const { page, limit } = filters;
    const offset = (page - 1) * limit;

    const [dataRes, countRes] = await Promise.all([
      pool.query(
        `SELECT * FROM notification_log
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset],
      ),
      pool.query(
        "SELECT COUNT(*) FROM notification_log WHERE user_id = $1",
        [userId],
      ),
    ]);

    const total = parseInt(countRes.rows[0].count, 10);

    return {
      data: dataRes.rows,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  },

  async markAsRead(id: string) {
    const { rowCount } = await pool.query(
      "UPDATE notification_log SET read = true WHERE id = $1",
      [id],
    );
    if (!rowCount) throw new AppError("Notificación no encontrada", 404, "NOTIFICATION_NOT_FOUND");
    logger.info(`Notification marked as read: ${id}`);
  },

  async markAllAsRead(userId: string) {
    await pool.query(
      "UPDATE notification_log SET read = true WHERE user_id = $1",
      [userId],
    );
    logger.info(`All notifications marked as read for user ${userId}`);
  },

  async sendNotification(userId: string, data: { title: string; message: string; type: string }) {
    await pool.query(
      `INSERT INTO notification_log (id, user_id, title, message, type, read, created_at)
       VALUES ($1, $2, $3, $4, $5, false, NOW())`,
      [uuidv4(), userId, data.title, data.message, data.type],
    );
    logger.info(`Notification sent to user ${userId}`);
  },
};
