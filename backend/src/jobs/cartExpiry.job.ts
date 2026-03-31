import { pool } from "../config/database";
import { logger } from "../utils/logger";

/**
 * Daily job: Clean up abandoned carts older than 7 days
 */
export async function cleanExpiredCarts() {
  try {
    // Delete cart items for expired carts
    const { rowCount: itemsDeleted } = await pool.query(
      `DELETE FROM cart_items
       WHERE cart_id IN (
         SELECT id FROM carts WHERE expires_at < NOW()
       )`,
    );

    // Delete expired carts
    const { rowCount: cartsDeleted } = await pool.query(
      "DELETE FROM carts WHERE expires_at < NOW()",
    );

    if (cartsDeleted && cartsDeleted > 0) {
      logger.info(
        `Cart cleanup: removed ${cartsDeleted} expired carts, ${itemsDeleted} items`,
      );
    }
  } catch (err) {
    logger.error("Cart expiry job failed:", err);
  }
}
