import { pool } from "../config/database";
import { v4 as uuidv4 } from "uuid";

export const notificationRepository = {
  // ─── Push Tokens ────────────────────────────────────

  async savePushToken(
    userId: string,
    token: string,
    platform: "ios" | "android",
  ) {
    const { rows } = await pool.query(
      `INSERT INTO push_tokens (id, user_id, token, platform, is_active)
       VALUES ($1, $2, $3, $4, true)
       ON CONFLICT (token)
       DO UPDATE SET user_id = $2, platform = $4, is_active = true
       RETURNING *`,
      [uuidv4(), userId, token, platform],
    );
    return rows[0];
  },

  async deletePushToken(userId: string, token: string) {
    await pool.query(
      "UPDATE push_tokens SET is_active = false WHERE user_id = $1 AND token = $2",
      [userId, token],
    );
  },

  async deactivateByToken(token: string) {
    await pool.query(
      "UPDATE push_tokens SET is_active = false WHERE token = $1",
      [token],
    );
  },

  async deleteAllPushTokens(userId: string) {
    await pool.query(
      "UPDATE push_tokens SET is_active = false WHERE user_id = $1",
      [userId],
    );
  },

  async findActivePushTokens(userId: string) {
    const { rows } = await pool.query(
      "SELECT * FROM push_tokens WHERE user_id = $1 AND is_active = true",
      [userId],
    );
    return rows;
  },

  // ─── Notification Preferences ───────────────────────

  async findOrCreatePreferences(userId: string) {
    const { rows } = await pool.query(
      "SELECT * FROM notification_preferences WHERE user_id = $1",
      [userId],
    );
    if (rows[0]) return rows[0];

    const { rows: created } = await pool.query(
      `INSERT INTO notification_preferences (id, user_id)
       VALUES ($1, $2)
       RETURNING *`,
      [uuidv4(), userId],
    );
    return created[0];
  },

  async updatePreferences(
    userId: string,
    data: {
      order_updates?: boolean;
      reorder_reminders?: boolean;
      promotions?: boolean;
      ai_suggestions?: boolean;
      email_notifications?: boolean;
    },
  ) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.order_updates !== undefined) {
      fields.push(`order_updates = $${idx++}`);
      values.push(data.order_updates);
    }
    if (data.reorder_reminders !== undefined) {
      fields.push(`reorder_reminders = $${idx++}`);
      values.push(data.reorder_reminders);
    }
    if (data.promotions !== undefined) {
      fields.push(`promotions = $${idx++}`);
      values.push(data.promotions);
    }
    if (data.ai_suggestions !== undefined) {
      fields.push(`ai_suggestions = $${idx++}`);
      values.push(data.ai_suggestions);
    }
    if (data.email_notifications !== undefined) {
      fields.push(`email_notifications = $${idx++}`);
      values.push(data.email_notifications);
    }

    if (fields.length === 0) {
      return notificationRepository.findOrCreatePreferences(userId);
    }

    // Ensure preferences row exists first
    await notificationRepository.findOrCreatePreferences(userId);

    values.push(userId);
    const { rows } = await pool.query(
      `UPDATE notification_preferences
       SET ${fields.join(", ")}, updated_at = NOW()
       WHERE user_id = $${idx}
       RETURNING *`,
      values,
    );
    return rows[0];
  },

  // ─── Notification Log ──────────────────────────────

  async createLog(data: {
    userId: string;
    pushTokenId?: string;
    campaignId?: string;
    orderId?: string;
    eventType: string;
    title: string;
    body: string;
    notifData?: object;
    expoReceiptId?: string;
  }) {
    const { rows } = await pool.query(
      `INSERT INTO notification_log
         (id, user_id, push_token_id, campaign_id, order_id,
          event_type, title, body, data, expo_receipt_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        uuidv4(),
        data.userId,
        data.pushTokenId || null,
        data.campaignId || null,
        data.orderId || null,
        data.eventType,
        data.title,
        data.body,
        JSON.stringify(data.notifData || {}),
        data.expoReceiptId || null,
      ],
    );
    return rows[0];
  },

  async findLogsByUserId(userId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;

    const [dataRes, countRes] = await Promise.all([
      pool.query(
        `SELECT * FROM notification_log
         WHERE user_id = $1
         ORDER BY sent_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset],
      ),
      pool.query(
        "SELECT COUNT(*) FROM notification_log WHERE user_id = $1",
        [userId],
      ),
    ]);

    return {
      rows: dataRes.rows,
      total: parseInt(countRes.rows[0].count, 10),
    };
  },

  async markOpened(logId: string) {
    await pool.query(
      "UPDATE notification_log SET status = 'opened', opened_at = NOW() WHERE id = $1",
      [logId],
    );
  },

  async updateLogStatus(logId: string, status: string, errorMessage?: string) {
    await pool.query(
      `UPDATE notification_log
       SET status = $1, error_message = $2
       WHERE id = $3`,
      [status, errorMessage || null, logId],
    );
  },

  async updateReceiptId(logId: string, receiptId: string) {
    await pool.query(
      "UPDATE notification_log SET expo_receipt_id = $1 WHERE id = $2",
      [receiptId, logId],
    );
  },

  async findPendingReceipts(limit: number = 100) {
    const { rows } = await pool.query(
      `SELECT nl.id, nl.expo_receipt_id, nl.push_token_id, pt.token AS push_token
         FROM notification_log nl
         LEFT JOIN push_tokens pt ON pt.id = nl.push_token_id
        WHERE nl.status = 'sent'
          AND nl.expo_receipt_id IS NOT NULL
          AND nl.sent_at > NOW() - INTERVAL '24 hours'
        LIMIT $1`,
      [limit],
    );
    return rows as Array<{
      id: string;
      expo_receipt_id: string;
      push_token_id: string | null;
      push_token: string | null;
    }>;
  },
};
