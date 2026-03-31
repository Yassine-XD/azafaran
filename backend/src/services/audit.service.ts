/**
 * Audit Service
 */

import { pool } from "../config/database";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../utils/logger";

export const auditService = {
  async logAction(
    userId: string,
    action: string,
    resource: string,
    details: { ip?: string; userAgent?: string; [key: string]: any },
  ) {
    const { rows } = await pool.query(
      `INSERT INTO audit_log (id, user_id, action, resource, details, ip_address, user_agent, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [
        uuidv4(),
        userId,
        action,
        resource,
        JSON.stringify(details),
        details.ip || null,
        details.userAgent || null,
      ],
    );

    logger.info(`Audit logged: ${action} on ${resource} by user ${userId}`);
    return rows[0];
  },

  async getAuditLogs(filters: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
    resource?: string;
  }) {
    const { page = 1, limit = 50, userId, action, resource } = filters;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (userId) {
      conditions.push(`user_id = $${idx++}`);
      values.push(userId);
    }
    if (action) {
      conditions.push(`action = $${idx++}`);
      values.push(action);
    }
    if (resource) {
      conditions.push(`resource = $${idx++}`);
      values.push(resource);
    }

    const where = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const [dataRes, countRes] = await Promise.all([
      pool.query(
        `SELECT * FROM audit_log ${where}
         ORDER BY created_at DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...values, limit, offset],
      ),
      pool.query(`SELECT COUNT(*) FROM audit_log ${where}`, values),
    ]);

    const total = parseInt(countRes.rows[0].count, 10);

    return {
      data: dataRes.rows,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  },
};
