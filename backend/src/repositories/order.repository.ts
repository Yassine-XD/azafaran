import { pool } from "../config/database";
import { v4 as uuidv4 } from "uuid";
import type { PlaceOrderInput } from "../validators/order.schema";

export interface OrderRow {
  id: string;
  order_number: string;
  user_id: string;
  address_id: string | null;
  address_snapshot: any;
  status: string;
  payment_status: string;
  payment_method: string;
  payment_ref: string | null;
  subtotal: string;
  delivery_fee: string;
  discount_amount: string;
  total: string;
  promo_code_id: string | null;
  delivery_slot_id: string | null;
  delivery_notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  variant_id: string | null;
  product_snapshot: any;
  quantity: number;
  unit_price: string;
  line_total: string;
}

export const orderRepository = {
  async create(data: {
    userId: string;
    addressId: string;
    addressSnapshot: object;
    paymentMethod: string;
    paymentRef?: string;
    subtotal: number;
    deliveryFee: number;
    discountAmount: number;
    total: number;
    promoCodeId?: string;
    deliveryNotes?: string;
    items: {
      variantId: string;
      productSnapshot: object;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
    }[];
  }): Promise<OrderRow> {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Create order
      const { rows: orderRows } = await client.query(
        `INSERT INTO orders (
           id, user_id, address_id, address_snapshot,
           payment_method, payment_ref,
           subtotal, delivery_fee, discount_amount, total,
           promo_code_id, delivery_notes,
           status, payment_status
         ) VALUES (
           $1, $2, $3, $4,
           $5, $6,
           $7, $8, $9, $10,
           $11, $12,
           'pending', 'pending'
         ) RETURNING *`,
        [
          uuidv4(),
          data.userId,
          data.addressId,
          JSON.stringify(data.addressSnapshot),
          data.paymentMethod,
          data.paymentRef || null,
          data.subtotal,
          data.deliveryFee,
          data.discountAmount,
          data.total,
          data.promoCodeId || null,
          data.deliveryNotes || null,
        ],
      );
      const order = orderRows[0];

      // Create order items
      for (const item of data.items) {
        await client.query(
          `INSERT INTO order_items
             (id, order_id, variant_id, product_snapshot, quantity, unit_price, line_total)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            uuidv4(),
            order.id,
            item.variantId,
            JSON.stringify(item.productSnapshot),
            item.quantity,
            item.unitPrice,
            item.lineTotal,
          ],
        );
      }

      // Decrement stock for each variant
      for (const item of data.items) {
        const stockResult = await client.query(
          `UPDATE product_variants
           SET stock_qty = stock_qty - $1
           WHERE id = $2 AND stock_qty >= $1`,
          [item.quantity, item.variantId],
        );
        if (stockResult.rowCount === 0) {
          const err: any = new Error(
            `Stock insuficiente para el producto (variante ${item.variantId})`,
          );
          err.statusCode = 400;
          err.code = "INSUFFICIENT_STOCK";
          throw err;
        }
      }

      // Increment promo used count if used
      if (data.promoCodeId) {
        await client.query(
          "UPDATE promo_codes SET used_count = used_count + 1 WHERE id = $1",
          [data.promoCodeId],
        );
      }

      await client.query("COMMIT");
      return order;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  async findByUserId(
    userId: string,
    page: number,
    limit: number,
    dateFrom?: string,
  ): Promise<{ rows: OrderRow[]; total: number }> {
    const offset = (page - 1) * limit;

    const dateFilter = dateFrom ? " AND created_at >= $2" : "";
    const countParams = dateFrom ? [userId, dateFrom] : [userId];

    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*) FROM orders WHERE user_id = $1${dateFilter}`,
      countParams,
    );
    const total = parseInt(countRows[0].count, 10);

    const orderParams = dateFrom
      ? [userId, dateFrom, limit, offset]
      : [userId, limit, offset];
    const limitIdx = dateFrom ? "$3" : "$2";
    const offsetIdx = dateFrom ? "$4" : "$3";

    const { rows } = await pool.query(
      `SELECT * FROM orders
       WHERE user_id = $1${dateFilter}
       ORDER BY created_at DESC
       LIMIT ${limitIdx} OFFSET ${offsetIdx}`,
      orderParams,
    );

    // Fetch items for all orders in one query
    if (rows.length > 0) {
      const orderIds = rows.map((r) => r.id);
      const { rows: items } = await pool.query(
        `SELECT * FROM order_items WHERE order_id = ANY($1) ORDER BY id`,
        [orderIds],
      );
      const itemsByOrder: Record<string, OrderItemRow[]> = {};
      for (const item of items) {
        if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
        itemsByOrder[item.order_id].push(item);
      }
      for (const order of rows) {
        (order as any).items = itemsByOrder[order.id] || [];
      }
    }

    return { rows, total };
  },

  async findById(
    id: string,
    userId?: string,
  ): Promise<(OrderRow & { items: OrderItemRow[] }) | null> {
    const conditions = userId
      ? "WHERE o.id = $1 AND o.user_id = $2"
      : "WHERE o.id = $1";
    const values = userId ? [id, userId] : [id];

    const { rows: orderRows } = await pool.query(
      `SELECT o.* FROM orders o ${conditions}`,
      values,
    );
    if (!orderRows[0]) return null;

    const { rows: items } = await pool.query(
      "SELECT * FROM order_items WHERE order_id = $1 ORDER BY id",
      [id],
    );

    return { ...orderRows[0], items };
  },

  async updateStatus(id: string, status: string): Promise<OrderRow | null> {
    const { rows } = await pool.query(
      `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id],
    );
    return rows[0] || null;
  },

  async updatePaymentStatus(
    id: string,
    paymentStatus: string,
    paymentRef?: string,
  ): Promise<void> {
    await pool.query(
      `UPDATE orders
       SET payment_status = $1, payment_ref = COALESCE($2, payment_ref)
       WHERE id = $3`,
      [paymentStatus, paymentRef || null, id],
    );
  },

  async findPromoUsageByUser(
    promoCodeId: string,
    userId: string,
  ): Promise<number> {
    const { rows } = await pool.query(
      `SELECT COUNT(*) FROM orders
       WHERE promo_code_id = $1 AND user_id = $2
       AND status NOT IN ('cancelled', 'refunded')`,
      [promoCodeId, userId],
    );
    return parseInt(rows[0].count, 10);
  },

  async existsReview(orderId: string): Promise<boolean> {
    const { rows } = await pool.query(
      "SELECT COUNT(*) FROM reviews WHERE order_id = $1",
      [orderId],
    );
    return parseInt(rows[0].count, 10) > 0;
  },

  async createReview(
    orderId: string,
    userId: string,
    rating: number,
    comment?: string,
  ): Promise<void> {
    await pool.query(
      `INSERT INTO reviews (id, order_id, user_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)`,
      [uuidv4(), orderId, userId, rating, comment || null],
    );
  },

  async findDeliverySlot(slotId: string) {
    const { rows } = await pool.query(
      `SELECT * FROM delivery_slots
       WHERE id = $1 AND is_active = true
       AND booked_count < max_orders
       AND date >= CURRENT_DATE + INTERVAL '2 days'`,
      [slotId],
    );
    return rows[0] || null;
  },

  async findPromoCode(code: string) {
    const { rows } = await pool.query(
      `SELECT * FROM promo_codes
       WHERE code = $1
       AND is_active = true
       AND (expires_at IS NULL OR expires_at > NOW())
       AND (max_uses IS NULL OR used_count < max_uses)`,
      [code.toUpperCase()],
    );
    return rows[0] || null;
  },
};
