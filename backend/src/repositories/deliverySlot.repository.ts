import { pool } from "../config/database";

export const deliverySlotRepository = {
  async findAvailable() {
    const { rows } = await pool.query(
      `SELECT id, date, start_time, end_time, max_orders, booked_count,
              (max_orders - booked_count) AS available_spots
       FROM delivery_slots
       WHERE is_active = true
         AND date >= CURRENT_DATE + INTERVAL '2 days'
         AND booked_count < max_orders
       ORDER BY date ASC, start_time ASC`,
    );
    return rows;
  },

  async findById(id: string) {
    const { rows } = await pool.query(
      "SELECT * FROM delivery_slots WHERE id = $1",
      [id],
    );
    return rows[0] || null;
  },
};
