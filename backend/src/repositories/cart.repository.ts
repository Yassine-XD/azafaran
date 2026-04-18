import { pool } from "../config/database";
import { v4 as uuidv4 } from "uuid";

export interface CartRow {
  id: string;
  user_id: string;
  expires_at: Date;
  updated_at: Date;
}

export interface CartItemRow {
  id: string;
  cart_id: string;
  variant_id: string;
  quantity: number;
  unit_price: string;
  added_at: Date;
  // Joined
  product_name?: string;
  product_name_i18n?: Record<string, string> | null;
  product_slug?: string;
  variant_label?: string;
  variant_label_i18n?: Record<string, string> | null;
  weight_grams?: number;
  current_price?: string;
  stock_qty?: number;
  halal_cert_id?: string;
  product_images?: any[];
}

export const cartRepository = {
  async findOrCreateCart(userId: string): Promise<CartRow> {
    // Try to find existing cart
    const { rows } = await pool.query(
      "SELECT * FROM carts WHERE user_id = $1",
      [userId],
    );
    if (rows[0]) return rows[0];

    // Create new cart
    const { rows: created } = await pool.query(
      `INSERT INTO carts (id, user_id, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')
       RETURNING *`,
      [uuidv4(), userId],
    );
    return created[0];
  },

  async getCartWithItems(
    userId: string,
  ): Promise<{ cart: CartRow; items: CartItemRow[] }> {
    const cart = await cartRepository.findOrCreateCart(userId);

    const { rows: items } = await pool.query(
      `SELECT
         ci.*,
         p.name        AS product_name,
         p.name_i18n   AS product_name_i18n,
         p.slug        AS product_slug,
         p.images      AS product_images,
         p.halal_cert_id,
         pv.label      AS variant_label,
         pv.label_i18n AS variant_label_i18n,
         pv.weight_grams,
         pv.price      AS current_price,
         pv.stock_qty
       FROM cart_items ci
       JOIN product_variants pv ON pv.id = ci.variant_id
       JOIN products p          ON p.id  = pv.product_id
       WHERE ci.cart_id = $1
       ORDER BY ci.added_at ASC`,
      [cart.id],
    );

    return { cart, items };
  },

  async findCartItem(
    cartId: string,
    itemId: string,
  ): Promise<CartItemRow | null> {
    const { rows } = await pool.query(
      "SELECT * FROM cart_items WHERE id = $1 AND cart_id = $2",
      [itemId, cartId],
    );
    return rows[0] || null;
  },

  async findCartItemByVariant(
    cartId: string,
    variantId: string,
  ): Promise<CartItemRow | null> {
    const { rows } = await pool.query(
      "SELECT * FROM cart_items WHERE cart_id = $1 AND variant_id = $2",
      [cartId, variantId],
    );
    return rows[0] || null;
  },

  async addItem(
    cartId: string,
    variantId: string,
    quantity: number,
    unitPrice: number,
  ): Promise<CartItemRow> {
    // If item already exists — increment quantity
    const existing = await cartRepository.findCartItemByVariant(
      cartId,
      variantId,
    );

    if (existing) {
      const { rows } = await pool.query(
        `UPDATE cart_items
         SET quantity = quantity + $1
         WHERE id = $2
         RETURNING *`,
        [quantity, existing.id],
      );
      return rows[0];
    }

    const { rows } = await pool.query(
      `INSERT INTO cart_items (id, cart_id, variant_id, quantity, unit_price)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [uuidv4(), cartId, variantId, quantity, unitPrice],
    );

    // Update cart updated_at
    await pool.query("UPDATE carts SET updated_at = NOW() WHERE id = $1", [
      cartId,
    ]);

    return rows[0];
  },

  async updateItemQuantity(itemId: string, quantity: number): Promise<void> {
    await pool.query("UPDATE cart_items SET quantity = $1 WHERE id = $2", [
      quantity,
      itemId,
    ]);
  },

  async removeItem(itemId: string): Promise<void> {
    await pool.query("DELETE FROM cart_items WHERE id = $1", [itemId]);
  },

  async clearCart(cartId: string): Promise<void> {
    await pool.query("DELETE FROM cart_items WHERE cart_id = $1", [cartId]);
    await pool.query("UPDATE carts SET updated_at = NOW() WHERE id = $1", [
      cartId,
    ]);
  },
};
