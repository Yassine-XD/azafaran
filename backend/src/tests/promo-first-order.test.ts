import request from "supertest";
import { v4 as uuidv4 } from "uuid";
import app from "../app";
import { pool } from "../config/database";

let accessToken: string;
let userId: string;
let variantId: string;
let addressId: string;
let promoId: string;
const promoCode = `NEWONLY_${Date.now()}`;

beforeAll(async () => {
  const reg = await request(app)
    .post("/api/v1/auth/register")
    .send({
      first_name: "Promo",
      last_name: "FirstOrder",
      email: `promo_first_order_${Date.now()}@test.com`,
      password: "Test1234!",
    });
  accessToken = reg.body.data.accessToken;
  userId = reg.body.data.user.id;

  const { rows } = await pool.query(
    `SELECT pv.id FROM product_variants pv
     JOIN products p ON p.id = pv.product_id
     WHERE pv.is_active = true AND pv.stock_qty > 5
     LIMIT 1`,
  );
  variantId = rows[0]?.id;

  const addr = await request(app)
    .post("/api/v1/users/me/addresses")
    .set("Authorization", `Bearer ${accessToken}`)
    .send({
      label: "Casa",
      street: "Carrer Test 1",
      city: "Barcelona",
      postcode: "08001",
      province: "Barcelona",
    });
  addressId = addr.body.data.id;

  const promo = await pool.query(
    `INSERT INTO promo_codes
       (id, code, type, value, min_order_amount, max_uses_per_user, first_order_only)
     VALUES ($1, $2, 'percent', 10, 0, 1, TRUE)
     RETURNING id`,
    [uuidv4(), promoCode],
  );
  promoId = promo.rows[0].id;

  await request(app)
    .post("/api/v1/cart/items")
    .set("Authorization", `Bearer ${accessToken}`)
    .send({ variant_id: variantId, quantity: 1 });
});

afterAll(async () => {
  await pool.query(
    "DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id = $1)",
    [userId],
  );
  await pool.query("DELETE FROM orders WHERE user_id = $1", [userId]);
  await pool.query(
    "DELETE FROM cart_items WHERE cart_id IN (SELECT id FROM carts WHERE user_id = $1)",
    [userId],
  );
  await pool.query("DELETE FROM carts WHERE user_id = $1", [userId]);
  await pool.query("DELETE FROM addresses WHERE user_id = $1", [userId]);
  await pool.query("DELETE FROM refresh_tokens WHERE user_id = $1", [userId]);
  await pool.query("DELETE FROM promo_codes WHERE id = $1", [promoId]);
  await pool.query("DELETE FROM users WHERE id = $1", [userId]);
  await pool.end();
});

describe("Promo first_order_only", () => {
  it("applies for a user with zero prior orders", async () => {
    const res = await request(app)
      .post("/api/v1/cart/apply-promo")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ code: promoCode });

    expect(res.status).toBe(200);
    expect(res.body.data.discount_amount).toBeGreaterThan(0);
  });

  it("rejects after the user places a non-cancelled order", async () => {
    const orderRes = await request(app)
      .post("/api/v1/orders")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        address_id: addressId,
        payment_method: "cash",
        delivery_notes: "",
      });
    expect(orderRes.status).toBe(201);

    await request(app)
      .post("/api/v1/cart/items")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ variant_id: variantId, quantity: 1 });

    const res = await request(app)
      .post("/api/v1/cart/apply-promo")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ code: promoCode });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("PROMO_NEW_CUSTOMERS_ONLY");
  });

  it("re-allows the code if the only prior order was cancelled", async () => {
    await pool.query(
      "UPDATE orders SET status = 'cancelled' WHERE user_id = $1",
      [userId],
    );

    const res = await request(app)
      .post("/api/v1/cart/apply-promo")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ code: promoCode });

    expect(res.status).toBe(200);
    expect(res.body.data.discount_amount).toBeGreaterThan(0);
  });
});
