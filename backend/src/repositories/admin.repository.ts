import { pool } from "../config/database";
import { v4 as uuidv4 } from "uuid";

export const adminRepository = {
  // ─── Dashboard ──────────────────────────────────────

  async getDashboardStats() {
    const [usersRes, ordersTodayRes, revenueRes, pendingOrdersRes] =
      await Promise.all([
        pool.query("SELECT COUNT(*) FROM users WHERE is_active = true"),
        pool.query(
          "SELECT COUNT(*) FROM orders WHERE created_at >= CURRENT_DATE",
        ),
        pool.query(
          `SELECT COALESCE(SUM(total::numeric), 0) AS revenue
           FROM orders WHERE status = 'delivered'`,
        ),
        pool.query(
          "SELECT COUNT(*) FROM orders WHERE status = 'pending'",
        ),
      ]);

    return {
      total_users: parseInt(usersRes.rows[0].count, 10),
      orders_today: parseInt(ordersTodayRes.rows[0].count, 10),
      total_revenue: parseFloat(revenueRes.rows[0].revenue),
      pending_orders: parseInt(pendingOrdersRes.rows[0].count, 10),
    };
  },

  // ─── Products CRUD ──────────────────────────────────

  async findAllProducts(filters: {
    page: number;
    limit: number;
    search?: string;
    category?: string;
    active?: boolean;
  }) {
    const { page, limit, search, category, active } = filters;
    const offset = (page - 1) * limit;
    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (active !== undefined) {
      conditions.push(`p.is_active = $${idx++}`);
      values.push(active);
    }
    if (category) {
      conditions.push(`c.slug = $${idx++}`);
      values.push(category);
    }
    if (search) {
      conditions.push(`(p.name ILIKE $${idx} OR p.description ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    const where = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const [countRes, dataRes] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) FROM products p
         JOIN categories c ON c.id = p.category_id
         ${where}`,
        values,
      ),
      pool.query(
        `SELECT p.*, c.name AS category_name, c.slug AS category_slug
         FROM products p
         JOIN categories c ON c.id = p.category_id
         ${where}
         ORDER BY p.created_at DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...values, limit, offset],
      ),
    ]);

    return {
      rows: dataRes.rows,
      total: parseInt(countRes.rows[0].count, 10),
    };
  },

  async createProduct(data: {
    category_id: string;
    name: string;
    slug: string;
    description?: string;
    short_desc?: string;
    price_per_kg: number;
    unit_type: string;
    halal_cert_id?: string;
    halal_cert_body?: string;
    images?: any[];
    tags?: string[];
    is_featured?: boolean;
    name_i18n?: Record<string, string>;
    description_i18n?: Record<string, string>;
    short_desc_i18n?: Record<string, string>;
  }) {
    const nameI18n = data.name_i18n ?? { es: data.name, ca: '', en: '' };
    const descI18n = data.description_i18n ?? { es: data.description ?? '', ca: '', en: '' };
    const shortI18n = data.short_desc_i18n ?? { es: data.short_desc ?? '', ca: '', en: '' };

    const { rows } = await pool.query(
      `INSERT INTO products
         (id, category_id, name, slug, description, short_desc,
          price_per_kg, unit_type, halal_cert_id, halal_cert_body,
          images, tags, is_featured,
          name_i18n, description_i18n, short_desc_i18n)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING *`,
      [
        uuidv4(),
        data.category_id,
        data.name,
        data.slug,
        data.description || null,
        data.short_desc || null,
        data.price_per_kg,
        data.unit_type || "kg",
        data.halal_cert_id || null,
        data.halal_cert_body || null,
        JSON.stringify(data.images || []),
        data.tags || [],
        data.is_featured || false,
        JSON.stringify(nameI18n),
        JSON.stringify(descI18n),
        JSON.stringify(shortI18n),
      ],
    );
    return rows[0];
  },

  async updateProduct(id: string, data: Record<string, any>) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const allowed = [
      "category_id", "name", "slug", "description", "short_desc",
      "price_per_kg", "unit_type", "halal_cert_id", "halal_cert_body",
      "is_featured", "is_active", "sort_order",
    ];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${idx++}`);
        values.push(data[key]);
      }
    }

    if (data.images !== undefined) {
      fields.push(`images = $${idx++}`);
      values.push(JSON.stringify(data.images));
    }
    if (data.tags !== undefined) {
      fields.push(`tags = $${idx++}`);
      values.push(data.tags);
    }
    if (data.name_i18n !== undefined) {
      fields.push(`name_i18n = $${idx++}`);
      values.push(JSON.stringify(data.name_i18n));
    }
    if (data.description_i18n !== undefined) {
      fields.push(`description_i18n = $${idx++}`);
      values.push(JSON.stringify(data.description_i18n));
    }
    if (data.short_desc_i18n !== undefined) {
      fields.push(`short_desc_i18n = $${idx++}`);
      values.push(JSON.stringify(data.short_desc_i18n));
    }

    if (fields.length === 0) return null;

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE products SET ${fields.join(", ")}
       WHERE id = $${idx} RETURNING *`,
      values,
    );
    return rows[0] || null;
  },

  async findProductById(id: string) {
    const { rows: productRows } = await pool.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE p.id = $1`,
      [id],
    );
    if (!productRows[0]) return null;

    const { rows: variants } = await pool.query(
      `SELECT * FROM product_variants
       WHERE product_id = $1
       ORDER BY sort_order ASC, weight_grams ASC`,
      [id],
    );

    return { ...productRows[0], variants };
  },

  async softDeleteProduct(id: string) {
    const { rows } = await pool.query(
      "UPDATE products SET is_active = false WHERE id = $1 RETURNING *",
      [id],
    );
    return rows[0] || null;
  },

  // ─── Product Variants ───────────────────────────────

  async createVariant(productId: string, data: {
    label: string;
    weight_grams: number;
    price: number;
    stock_qty: number;
    sku?: string;
    label_i18n?: Record<string, string>;
  }) {
    const labelI18n = data.label_i18n ?? { es: data.label, ca: data.label, en: data.label };
    const { rows } = await pool.query(
      `INSERT INTO product_variants
         (id, product_id, label, weight_grams, price, stock_qty, sku, label_i18n)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        uuidv4(),
        productId,
        data.label,
        data.weight_grams,
        data.price,
        data.stock_qty,
        data.sku || null,
        JSON.stringify(labelI18n),
      ],
    );
    return rows[0];
  },

  async updateVariant(variantId: string, data: Record<string, any>) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const allowed = [
      "label", "weight_grams", "price", "stock_qty", "sku",
      "is_active", "sort_order",
    ];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${idx++}`);
        values.push(data[key]);
      }
    }

    if (data.label_i18n !== undefined) {
      fields.push(`label_i18n = $${idx++}`);
      values.push(JSON.stringify(data.label_i18n));
    }

    if (fields.length === 0) return null;

    values.push(variantId);
    const { rows } = await pool.query(
      `UPDATE product_variants SET ${fields.join(", ")}
       WHERE id = $${idx} RETURNING *`,
      values,
    );
    return rows[0] || null;
  },

  async deleteVariant(id: string) {
    await pool.query("DELETE FROM product_variants WHERE id = $1", [id]);
  },

  // ─── Pack Items ─────────────────────────────────────

  async findPackItems(packId: string) {
    const { rows } = await pool.query(
      `SELECT pi.*, p.name AS product_name, p.images AS product_images,
              p.price_per_kg AS product_price_per_kg, c.name AS product_category_name
       FROM pack_items pi
       JOIN products p ON p.id = pi.product_id
       JOIN categories c ON c.id = p.category_id
       WHERE pi.pack_id = $1
       ORDER BY pi.sort_order ASC, pi.created_at ASC`,
      [packId],
    );
    return rows;
  },

  async addPackItem(packId: string, data: {
    product_id: string;
    quantity?: number;
    custom_label?: string;
    sort_order?: number;
  }) {
    const { rows } = await pool.query(
      `INSERT INTO pack_items (id, pack_id, product_id, quantity, custom_label, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        uuidv4(),
        packId,
        data.product_id,
        data.quantity || 1,
        data.custom_label || null,
        data.sort_order ?? 0,
      ],
    );
    return rows[0];
  },

  async updatePackItem(itemId: string, data: Record<string, any>) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const allowed = ["quantity", "custom_label", "sort_order"];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${idx++}`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) return null;

    values.push(itemId);
    const { rows } = await pool.query(
      `UPDATE pack_items SET ${fields.join(", ")}
       WHERE id = $${idx} RETURNING *`,
      values,
    );
    return rows[0] || null;
  },

  async deletePackItem(itemId: string) {
    await pool.query("DELETE FROM pack_items WHERE id = $1", [itemId]);
  },

  async findPackItemById(itemId: string) {
    const { rows } = await pool.query(
      "SELECT * FROM pack_items WHERE id = $1",
      [itemId],
    );
    return rows[0] || null;
  },

  // ─── Orders Management ──────────────────────────────

  async findAllOrders(filters: {
    page: number;
    limit: number;
    status?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const { page, limit, status, userId, dateFrom, dateTo } = filters;
    const offset = (page - 1) * limit;
    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (status) {
      conditions.push(`o.status = $${idx++}`);
      values.push(status);
    }
    if (userId) {
      conditions.push(`o.user_id = $${idx++}`);
      values.push(userId);
    }
    if (dateFrom) {
      conditions.push(`o.created_at >= $${idx++}`);
      values.push(dateFrom);
    }
    if (dateTo) {
      conditions.push(`o.created_at <= $${idx++}`);
      values.push(dateTo);
    }

    const where = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const [countRes, dataRes] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM orders o ${where}`, values),
      pool.query(
        `SELECT o.*, u.first_name, u.last_name, u.email
         FROM orders o
         LEFT JOIN users u ON u.id = o.user_id
         ${where}
         ORDER BY o.created_at DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...values, limit, offset],
      ),
    ]);

    return {
      rows: dataRes.rows,
      total: parseInt(countRes.rows[0].count, 10),
    };
  },

  async findOrderById(orderId: string) {
    const { rows: orderRows } = await pool.query(
      `SELECT o.*,
              u.first_name, u.last_name, u.email, u.phone,
              ds.date AS slot_date, ds.start_time AS slot_start, ds.end_time AS slot_end
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
       LEFT JOIN delivery_slots ds ON ds.id = o.delivery_slot_id
       WHERE o.id = $1`,
      [orderId],
    );
    if (!orderRows[0]) return null;

    const { rows: items } = await pool.query(
      "SELECT * FROM order_items WHERE order_id = $1 ORDER BY id",
      [orderId],
    );

    return { ...orderRows[0], items };
  },

  // ─── Users ──────────────────────────────────────────

  async findAllUsers(filters: {
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
        `(u.first_name ILIKE $${idx} OR u.last_name ILIKE $${idx} OR u.email ILIKE $${idx})`,
      );
      values.push(`%${search}%`);
      idx++;
    }

    const where = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const [countRes, dataRes] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM users u ${where}`, values),
      pool.query(
        `SELECT id, email, first_name, last_name, phone, role,
                is_active, is_verified, created_at
         FROM users u ${where}
         ORDER BY u.created_at DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...values, limit, offset],
      ),
    ]);

    return {
      rows: dataRes.rows,
      total: parseInt(countRes.rows[0].count, 10),
    };
  },

  async findUserById(userId: string) {
    const { rows } = await pool.query(
      `SELECT id, email, first_name, last_name, phone, role,
              is_active, is_verified, family_size, preferred_lang, created_at
       FROM users WHERE id = $1`,
      [userId],
    );
    return rows[0] || null;
  },

  async updateUser(id: string, data: Record<string, any>) {
    const fields = Object.keys(data);
    const sets = fields.map((f, i) => `${f} = $${i + 2}`).join(", ");
    const values = fields.map((f) => data[f]);
    const { rows } = await pool.query(
      `UPDATE users SET ${sets} WHERE id = $1 RETURNING id, email, first_name, last_name, phone, role, is_active, is_verified, created_at`,
      [id, ...values],
    );
    return rows[0] || null;
  },

  // ─── Promotions CRUD ────────────────────────────────

  async findAllPromotions(page: number, limit: number) {
    const offset = (page - 1) * limit;
    const [countRes, dataRes] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM promotions"),
      pool.query(
        `SELECT * FROM promotions ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
        [limit, offset],
      ),
    ]);
    return {
      rows: dataRes.rows,
      total: parseInt(countRes.rows[0].count, 10),
    };
  },

  async createPromotion(data: Record<string, any>) {
    const { rows } = await pool.query(
      `INSERT INTO promotions
         (id, title, subtitle, type, scope, product_id, category_id,
          discount_type, discount_value, image_url, badge_text,
          show_on_home, show_on_product, priority, starts_at, ends_at, is_active, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       RETURNING *`,
      [
        uuidv4(),
        data.title,
        data.subtitle || null,
        data.type || "deal",
        data.scope || "all",
        data.product_id || null,
        data.category_id || null,
        data.discount_type || null,
        data.discount_value || null,
        data.image_url || null,
        data.badge_text || null,
        data.show_on_home || false,
        data.show_on_product || false,
        data.priority || 0,
        data.starts_at || new Date(),
        data.ends_at || null,
        data.is_active ?? true,
        data.created_by || null,
      ],
    );
    return rows[0];
  },

  async updatePromotion(id: string, data: Record<string, any>) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const allowed = [
      "title", "subtitle", "type", "scope", "product_id", "category_id",
      "discount_type", "discount_value", "image_url", "badge_text",
      "show_on_home", "show_on_product", "priority", "starts_at",
      "ends_at", "is_active",
    ];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${idx++}`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE promotions SET ${fields.join(", ")}
       WHERE id = $${idx} RETURNING *`,
      values,
    );
    return rows[0] || null;
  },

  async deletePromotion(id: string) {
    const { rows } = await pool.query(
      "UPDATE promotions SET is_active = false WHERE id = $1 RETURNING *",
      [id],
    );
    return rows[0] || null;
  },

  // ─── Banners CRUD ───────────────────────────────────

  async findAllBanners(page: number, limit: number) {
    const offset = (page - 1) * limit;
    const [countRes, dataRes] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM banners"),
      pool.query(
        "SELECT * FROM banners ORDER BY display_order ASC LIMIT $1 OFFSET $2",
        [limit, offset],
      ),
    ]);
    return {
      rows: dataRes.rows,
      total: parseInt(countRes.rows[0].count, 10),
    };
  },

  async createBanner(data: Record<string, any>) {
    const { rows } = await pool.query(
      `INSERT INTO banners
         (id, title, subtitle, image_url, link_type, link_value, bg_color, content,
          display_order, starts_at, ends_at, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        uuidv4(),
        data.title,
        data.subtitle || null,
        data.image_url || null,
        data.link_type || null,
        data.link_value || null,
        data.bg_color || null,
        data.content || null,
        data.display_order || 0,
        data.starts_at || null,
        data.ends_at || null,
        data.is_active ?? true,
      ],
    );
    return rows[0];
  },

  async updateBanner(id: string, data: Record<string, any>) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const allowed = [
      "title", "subtitle", "image_url", "link_type", "link_value",
      "bg_color", "content", "display_order", "starts_at", "ends_at", "is_active",
    ];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${idx++}`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE banners SET ${fields.join(", ")}
       WHERE id = $${idx} RETURNING *`,
      values,
    );
    return rows[0] || null;
  },

  async deleteBanner(id: string) {
    const { rows } = await pool.query(
      "UPDATE banners SET is_active = false WHERE id = $1 RETURNING *",
      [id],
    );
    return rows[0] || null;
  },

  // ─── Promo Codes CRUD ───────────────────────────────

  async findAllPromoCodes(page: number, limit: number) {
    const offset = (page - 1) * limit;
    const [countRes, dataRes] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM promo_codes"),
      pool.query(
        "SELECT * FROM promo_codes ORDER BY created_at DESC LIMIT $1 OFFSET $2",
        [limit, offset],
      ),
    ]);
    return {
      rows: dataRes.rows,
      total: parseInt(countRes.rows[0].count, 10),
    };
  },

  async createPromoCode(data: {
    code: string;
    type: string;
    value: number;
    min_order_amount?: number;
    max_uses?: number;
    max_uses_per_user?: number;
    expires_at?: string;
  }) {
    const { rows } = await pool.query(
      `INSERT INTO promo_codes
         (id, code, type, value, min_order_amount, max_uses, max_uses_per_user, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        uuidv4(),
        data.code.toUpperCase(),
        data.type,
        data.value,
        data.min_order_amount || 0,
        data.max_uses || null,
        data.max_uses_per_user || 1,
        data.expires_at || null,
      ],
    );
    return rows[0];
  },

  async updatePromoCode(id: string, data: Record<string, any>) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const allowed = [
      "code", "type", "value", "min_order_amount",
      "max_uses", "max_uses_per_user", "expires_at", "is_active",
    ];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${idx++}`);
        values.push(key === "code" ? data[key].toUpperCase() : data[key]);
      }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE promo_codes SET ${fields.join(", ")}
       WHERE id = $${idx} RETURNING *`,
      values,
    );
    return rows[0] || null;
  },

  async deletePromoCode(id: string) {
    const { rows } = await pool.query(
      "UPDATE promo_codes SET is_active = false WHERE id = $1 RETURNING *",
      [id],
    );
    return rows[0] || null;
  },

  // ─── Delivery Slots ─────────────────────────────────

  async findAllDeliverySlots(page: number, limit: number) {
    const offset = (page - 1) * limit;
    const [countRes, dataRes] = await Promise.all([
      pool.query(
        "SELECT COUNT(*) FROM delivery_slots WHERE date >= CURRENT_DATE",
      ),
      pool.query(
        `SELECT * FROM delivery_slots
         WHERE date >= CURRENT_DATE
         ORDER BY date ASC, start_time ASC
         LIMIT $1 OFFSET $2`,
        [limit, offset],
      ),
    ]);
    return {
      rows: dataRes.rows,
      total: parseInt(countRes.rows[0].count, 10),
    };
  },

  async bulkCreateDeliverySlots(
    slots: Array<{
      date: string;
      start_time: string;
      end_time: string;
      max_orders?: number;
    }>,
  ) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const created = [];

      for (const slot of slots) {
        const { rows } = await client.query(
          `INSERT INTO delivery_slots (id, date, start_time, end_time, max_orders)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (date, start_time) DO NOTHING
           RETURNING *`,
          [
            uuidv4(),
            slot.date,
            slot.start_time,
            slot.end_time,
            slot.max_orders || 10,
          ],
        );
        if (rows[0]) created.push(rows[0]);
      }

      await client.query("COMMIT");
      return created;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  // ─── Audit Log ──────────────────────────────────────

  async findAuditLogs(filters: {
    page: number;
    limit: number;
    adminId?: string;
    action?: string;
    entity?: string;
  }) {
    const { page, limit, adminId, action, entity } = filters;
    const offset = (page - 1) * limit;
    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (adminId) {
      conditions.push(`a.admin_id = $${idx++}`);
      values.push(adminId);
    }
    if (action) {
      conditions.push(`a.action = $${idx++}`);
      values.push(action);
    }
    if (entity) {
      conditions.push(`a.entity = $${idx++}`);
      values.push(entity);
    }

    const where = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const [countRes, dataRes] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM audit_log a ${where}`, values),
      pool.query(
        `SELECT a.*, u.first_name, u.last_name, u.email
         FROM audit_log a
         LEFT JOIN users u ON u.id = a.admin_id
         ${where}
         ORDER BY a.created_at DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...values, limit, offset],
      ),
    ]);

    return {
      rows: dataRes.rows,
      total: parseInt(countRes.rows[0].count, 10),
    };
  },

  async createAuditLog(data: {
    adminId: string;
    action: string;
    entity: string;
    entityId?: string;
    before?: object;
    after?: object;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const { rows } = await pool.query(
      `INSERT INTO audit_log
         (id, admin_id, action, entity, entity_id, before, after, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        uuidv4(),
        data.adminId,
        data.action,
        data.entity,
        data.entityId || null,
        data.before ? JSON.stringify(data.before) : null,
        data.after ? JSON.stringify(data.after) : null,
        data.ipAddress || null,
        data.userAgent || null,
      ],
    );
    return rows[0];
  },

  // ─── Reviews ────────────────────────────────────────

  async findAllReviews(page: number, limit: number) {
    const offset = (page - 1) * limit;
    const [countRes, dataRes] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM reviews"),
      pool.query(
        `SELECT r.*, u.first_name, u.last_name,
                o.order_number
         FROM reviews r
         LEFT JOIN users u ON u.id = r.user_id
         LEFT JOIN orders o ON o.id = r.order_id
         ORDER BY r.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset],
      ),
    ]);
    return {
      rows: dataRes.rows,
      total: parseInt(countRes.rows[0].count, 10),
    };
  },

  // ─── Notification Campaigns ─────────────────────────

  async findAllCampaigns(page: number, limit: number) {
    const offset = (page - 1) * limit;
    const [countRes, dataRes] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM notification_campaigns"),
      pool.query(
        `SELECT * FROM notification_campaigns
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset],
      ),
    ]);
    return {
      rows: dataRes.rows,
      total: parseInt(countRes.rows[0].count, 10),
    };
  },

  async createCampaign(data: {
    title: string;
    body: string;
    type?: string;
    target?: string;
    targetUserIds?: string[];
    deepLink?: string;
    promotionId?: string;
    imageUrl?: string;
    scheduledAt?: string;
    createdBy: string;
  }) {
    const { rows } = await pool.query(
      `INSERT INTO notification_campaigns
         (id, title, body, type, target, target_user_ids,
          deep_link, promotion_id, image_url, scheduled_at, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        uuidv4(),
        data.title,
        data.body,
        data.type || "campaign",
        data.target || "all",
        data.targetUserIds || null,
        data.deepLink || null,
        data.promotionId || null,
        data.imageUrl || null,
        data.scheduledAt || null,
        data.createdBy,
      ],
    );
    return rows[0];
  },

  // ─── Categories ────────────────────────────────────

  async findAllCategories(page: number, limit: number) {
    const offset = (page - 1) * limit;
    const [dataRes, countRes] = await Promise.all([
      pool.query(
        `SELECT * FROM categories
         ORDER BY display_order ASC, name ASC
         LIMIT $1 OFFSET $2`,
        [limit, offset],
      ),
      pool.query("SELECT COUNT(*) FROM categories"),
    ]);
    return { rows: dataRes.rows, total: parseInt(countRes.rows[0].count, 10) };
  },

  async createCategory(data: {
    name: string;
    slug: string;
    description?: string;
    image_url?: string;
    display_order?: number;
    is_active?: boolean;
    name_i18n?: Record<string, string>;
    description_i18n?: Record<string, string>;
  }) {
    const nameI18n = data.name_i18n ?? { es: data.name, ca: '', en: '' };
    const descI18n = data.description_i18n ?? { es: data.description ?? '', ca: '', en: '' };

    const { rows } = await pool.query(
      `INSERT INTO categories
         (id, name, slug, description, image_url, display_order, is_active,
          name_i18n, description_i18n)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        uuidv4(),
        data.name,
        data.slug,
        data.description || null,
        data.image_url || null,
        data.display_order ?? 0,
        data.is_active ?? true,
        JSON.stringify(nameI18n),
        JSON.stringify(descI18n),
      ],
    );
    return rows[0];
  },

  async updateCategory(id: string, data: Record<string, unknown>) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const allowed = ["name", "slug", "description", "image_url", "display_order", "is_active"];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${idx++}`);
        values.push(data[key]);
      }
    }

    if (data.name_i18n !== undefined) {
      fields.push(`name_i18n = $${idx++}`);
      values.push(JSON.stringify(data.name_i18n));
    }
    if (data.description_i18n !== undefined) {
      fields.push(`description_i18n = $${idx++}`);
      values.push(JSON.stringify(data.description_i18n));
    }

    if (fields.length === 0) return null;

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE categories SET ${fields.join(", ")}, updated_at = NOW()
       WHERE id = $${idx} RETURNING *`,
      values,
    );
    return rows[0];
  },

  async deleteCategory(id: string) {
    const { rows } = await pool.query(
      "UPDATE categories SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *",
      [id],
    );
    return rows[0];
  },
};
