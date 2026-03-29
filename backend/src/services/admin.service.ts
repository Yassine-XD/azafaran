/**
 * Admin Service — dashboard, user management, order management, analytics
 */

import { pool } from "../config/database";
import { orderRepository } from "../repositories/order.repository";
import { logger } from "../utils/logger";

function appError(message: string, statusCode: number, code: string) {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

export const adminService = {
  async getDashboard() {
    const [usersCount, ordersToday, revenue] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users WHERE is_active = true"),
      pool.query(
        "SELECT COUNT(*) FROM orders WHERE created_at >= CURRENT_DATE",
      ),
      pool.query(
        "SELECT COALESCE(SUM(total::numeric), 0) AS revenue FROM orders WHERE status = 'delivered'",
      ),
    ]);

    return {
      total_users: parseInt(usersCount.rows[0].count, 10),
      orders_today: parseInt(ordersToday.rows[0].count, 10),
      total_revenue: parseFloat(revenue.rows[0].revenue),
    };
  },

  async getAllUsers(filters: {
    page: number;
    limit: number;
    search?: string;
  }) {
    const { page, limit, search } = filters;
    const offset = (page - 1) * limit;
    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (search) {
      conditions.push(
        `(first_name ILIKE $${idx} OR last_name ILIKE $${idx} OR email ILIKE $${idx})`,
      );
      values.push(`%${search}%`);
      idx++;
    }

    const where = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const countRes = await pool.query(
      `SELECT COUNT(*) FROM users ${where}`,
      values,
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const { rows } = await pool.query(
      `SELECT id, email, first_name, last_name, phone, role, is_active, created_at
       FROM users ${where}
       ORDER BY created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, limit, offset],
    );

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  async getAllOrders(filters: {
    page: number;
    limit: number;
    status?: string;
    userId?: string;
  }) {
    const { page, limit, status, userId } = filters;
    const offset = (page - 1) * limit;
    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (status) {
      conditions.push(`status = $${idx++}`);
      values.push(status);
    }
    if (userId) {
      conditions.push(`user_id = $${idx++}`);
      values.push(userId);
    }

    const where = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const countRes = await pool.query(
      `SELECT COUNT(*) FROM orders ${where}`,
      values,
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const { rows } = await pool.query(
      `SELECT * FROM orders ${where}
       ORDER BY created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, limit, offset],
    );

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  async updateOrderStatus(orderId: string, status: string) {
    const order = await orderRepository.updateStatus(orderId, status);
    if (!order)
      throw appError("Pedido no encontrado", 404, "ORDER_NOT_FOUND");
    logger.info(`Order ${orderId} status updated to ${status}`);
    return order;
  },

  async getAnalytics(startDate?: string, endDate?: string) {
    const start = startDate || new Date(Date.now() - 30 * 86400000).toISOString();
    const end = endDate || new Date().toISOString();

    const { rows } = await pool.query(
      `SELECT
         DATE(created_at) AS date,
         COUNT(*) AS order_count,
         SUM(total::numeric) AS daily_revenue
       FROM orders
       WHERE created_at >= $1 AND created_at <= $2
         AND status NOT IN ('cancelled', 'refunded')
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [start, end],
    );

    return rows;
  },

  async getReports(type: string) {
    if (type === "sales") {
      const { rows } = await pool.query(
        `SELECT
           DATE_TRUNC('month', created_at) AS month,
           COUNT(*) AS orders,
           SUM(total::numeric) AS revenue
         FROM orders
         WHERE status = 'delivered'
         GROUP BY month
         ORDER BY month DESC
         LIMIT 12`,
      );
      return rows;
    }

    return [];
  },

  async sendBroadcastNotification(
    _message: string,
    _title: string,
    _targetUsers?: string[],
  ) {
    logger.info("Broadcast notification — not yet implemented");
  },
};
