import { pool } from "../config/database";

export type AttachmentInput = {
  file_url: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
};

export type TicketListFilters = {
  userId?: string;
  status?: string;
  category?: string;
  priority?: string;
  q?: string;
  page: number;
  limit: number;
};

export const ticketRepository = {
  // ─── Create ─────────────────────────────────────────

  async createTicketWithFirstMessage(params: {
    userId: string;
    subject: string;
    category: string;
    body: string;
    attachments: AttachmentInput[];
  }) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const { rows: ticketRows } = await client.query(
        `INSERT INTO support_tickets (user_id, subject, category)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [params.userId, params.subject, params.category],
      );
      const ticket = ticketRows[0];

      const { rows: msgRows } = await client.query(
        `INSERT INTO support_ticket_messages
           (ticket_id, sender_type, sender_id, body)
         VALUES ($1, 'user', $2, $3)
         RETURNING *`,
        [ticket.id, params.userId, params.body],
      );
      const message = msgRows[0];

      const attachments = [];
      for (const a of params.attachments) {
        const { rows } = await client.query(
          `INSERT INTO support_ticket_attachments
             (message_id, file_url, file_name, mime_type, size_bytes)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [message.id, a.file_url, a.file_name, a.mime_type, a.size_bytes],
        );
        attachments.push(rows[0]);
      }

      await client.query("COMMIT");
      return { ticket, message, attachments };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  async addMessage(params: {
    ticketId: string;
    senderType: "user" | "admin";
    senderId: string;
    body: string;
    attachments: AttachmentInput[];
    reopenIfClosed: boolean;
  }) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const { rows: msgRows } = await client.query(
        `INSERT INTO support_ticket_messages
           (ticket_id, sender_type, sender_id, body)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [params.ticketId, params.senderType, params.senderId, params.body],
      );
      const message = msgRows[0];

      const attachments = [];
      for (const a of params.attachments) {
        const { rows } = await client.query(
          `INSERT INTO support_ticket_attachments
             (message_id, file_url, file_name, mime_type, size_bytes)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [message.id, a.file_url, a.file_name, a.mime_type, a.size_bytes],
        );
        attachments.push(rows[0]);
      }

      // Update ticket: bump last_message_at + unread flags + reopen if needed
      const statusClause = params.reopenIfClosed
        ? `status = CASE WHEN status IN ('resolved','closed') THEN 'open'::ticket_status ELSE status END,`
        : "";

      const unreadClause =
        params.senderType === "user"
          ? "unread_for_admin = true, unread_for_user = false,"
          : "unread_for_user = true, unread_for_admin = false,";

      const { rows: ticketRows } = await client.query(
        `UPDATE support_tickets
         SET ${statusClause}
             ${unreadClause}
             last_message_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [params.ticketId],
      );

      await client.query("COMMIT");
      return { ticket: ticketRows[0], message, attachments };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  // ─── Read ───────────────────────────────────────────

  async findById(id: string) {
    const { rows } = await pool.query(
      "SELECT * FROM support_tickets WHERE id = $1",
      [id],
    );
    return rows[0] || null;
  },

  async findByIdForUser(id: string, userId: string) {
    const { rows } = await pool.query(
      "SELECT * FROM support_tickets WHERE id = $1 AND user_id = $2",
      [id, userId],
    );
    return rows[0] || null;
  },

  async findMessagesWithAttachments(ticketId: string) {
    const { rows } = await pool.query(
      `SELECT m.*,
              COALESCE(
                (SELECT json_agg(a.* ORDER BY a.created_at)
                 FROM support_ticket_attachments a
                 WHERE a.message_id = m.id),
                '[]'::json
              ) AS attachments
       FROM support_ticket_messages m
       WHERE m.ticket_id = $1
       ORDER BY m.created_at ASC`,
      [ticketId],
    );
    return rows;
  },

  async list(filters: TicketListFilters) {
    const { page, limit } = filters;
    const offset = (page - 1) * limit;
    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (filters.userId) {
      conditions.push(`t.user_id = $${idx++}`);
      values.push(filters.userId);
    }
    if (filters.status) {
      conditions.push(`t.status = $${idx++}`);
      values.push(filters.status);
    }
    if (filters.category) {
      conditions.push(`t.category = $${idx++}`);
      values.push(filters.category);
    }
    if (filters.priority) {
      conditions.push(`t.priority = $${idx++}`);
      values.push(filters.priority);
    }
    if (filters.q) {
      conditions.push(
        `(t.subject ILIKE $${idx} OR t.ticket_number ILIKE $${idx})`,
      );
      values.push(`%${filters.q}%`);
      idx++;
    }

    const where = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const baseSelect = `
      SELECT t.*,
             u.first_name AS user_first_name,
             u.last_name  AS user_last_name,
             u.email      AS user_email,
             (SELECT body FROM support_ticket_messages
               WHERE ticket_id = t.id
               ORDER BY created_at DESC LIMIT 1) AS last_message
      FROM support_tickets t
      JOIN users u ON u.id = t.user_id
      ${where}
      ORDER BY t.last_message_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;
    values.push(limit, offset);

    const [dataRes, countRes] = await Promise.all([
      pool.query(baseSelect, values),
      pool.query(
        `SELECT COUNT(*) FROM support_tickets t ${where}`,
        values.slice(0, idx - 1),
      ),
    ]);

    return {
      rows: dataRes.rows,
      total: parseInt(countRes.rows[0].count, 10),
    };
  },

  // ─── Update ─────────────────────────────────────────

  async markReadForUser(ticketId: string) {
    await pool.query(
      "UPDATE support_tickets SET unread_for_user = false WHERE id = $1",
      [ticketId],
    );
  },

  async markReadForAdmin(ticketId: string) {
    await pool.query(
      "UPDATE support_tickets SET unread_for_admin = false WHERE id = $1",
      [ticketId],
    );
  },

  async adminUpdate(
    ticketId: string,
    data: {
      status?: string;
      priority?: string;
      assigned_to?: string | null;
    },
  ) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.status !== undefined) {
      fields.push(`status = $${idx++}`);
      values.push(data.status);
    }
    if (data.priority !== undefined) {
      fields.push(`priority = $${idx++}`);
      values.push(data.priority);
    }
    if (data.assigned_to !== undefined) {
      fields.push(`assigned_to = $${idx++}`);
      values.push(data.assigned_to);
    }

    if (!fields.length) return this.findById(ticketId);

    values.push(ticketId);
    const { rows } = await pool.query(
      `UPDATE support_tickets
       SET ${fields.join(", ")}
       WHERE id = $${idx}
       RETURNING *`,
      values,
    );
    return rows[0];
  },

  async countOpenForAdmin() {
    const { rows } = await pool.query(
      `SELECT COUNT(*) FROM support_tickets
       WHERE status IN ('open', 'in_progress', 'waiting_user')`,
    );
    return parseInt(rows[0].count, 10);
  },

  async countUnreadForAdmin() {
    const { rows } = await pool.query(
      "SELECT COUNT(*) FROM support_tickets WHERE unread_for_admin = true",
    );
    return parseInt(rows[0].count, 10);
  },
};
