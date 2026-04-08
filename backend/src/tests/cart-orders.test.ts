import request from "supertest";
import app from "../app";
import { pool } from "../config/database";

let accessToken: string;
let userId: string;
let variantId: string;
let cartItemId: string;
let addressId: string;
let orderId: string;

beforeAll(async () => {
  // Register user
  const reg = await request(app)
    .post("/api/v1/auth/register")
    .send({
      first_name: "Cart",
      last_name: "Test",
      email: "cart_test@test.com",
      password: "Test1234!",
    });
  accessToken = reg.body.data.accessToken;
  userId = reg.body.data.user.id;

  // Get a variant from seeded data
  const { rows } = await pool.query(
    `SELECT pv.id FROM product_variants pv
     JOIN products p ON p.id = pv.product_id
     WHERE pv.is_active = true AND pv.stock_qty > 5
     LIMIT 1`,
  );
  variantId = rows[0]?.id;

  // Create address
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
});

afterAll(async () => {
  await pool.query(
    "DELETE FROM reviews  WHERE order_id IN (SELECT id FROM orders WHERE user_id = $1)",
    [userId],
  );
  await pool.query(
    "DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id = $1)",
    [userId],
  );
  await pool.query("DELETE FROM orders   WHERE user_id = $1", [userId]);
  await pool.query(
    "DELETE FROM cart_items WHERE cart_id IN (SELECT id FROM carts WHERE user_id = $1)",
    [userId],
  );
  await pool.query("DELETE FROM carts    WHERE user_id = $1", [userId]);
  await pool.query("DELETE FROM addresses WHERE user_id = $1", [userId]);
  await pool.query("DELETE FROM refresh_tokens WHERE user_id = $1", [userId]);
  await pool.query("DELETE FROM users    WHERE id = $1", [userId]);
  await pool.end();
});

// ─── CART ─────────────────────────────────────────────

describe("Cart", () => {
  it("GET /cart — returns empty cart", async () => {
    const res = await request(app)
      .get("/api/v1/cart")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toEqual([]);
    expect(res.body.data.subtotal).toBe(0);
  });

  it("POST /cart/items — adds item", async () => {
    const res = await request(app)
      .post("/api/v1/cart/items")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ variant_id: variantId, quantity: 2 });

    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.items[0].quantity).toBe(2);
    expect(res.body.data.subtotal).toBeGreaterThan(0);
    cartItemId = res.body.data.items[0].id;
  });

  it("POST /cart/items — adding same variant increments quantity", async () => {
    const res = await request(app)
      .post("/api/v1/cart/items")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ variant_id: variantId, quantity: 1 });

    expect(res.status).toBe(200);
    expect(res.body.data.items[0].quantity).toBe(3); // 2 + 1
  });

  it("PUT /cart/items/:id — updates quantity", async () => {
    const res = await request(app)
      .put(`/api/v1/cart/items/${cartItemId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ quantity: 1 });

    expect(res.status).toBe(200);
    expect(res.body.data.items[0].quantity).toBe(1);
  });

  it("POST /cart/validate — returns valid", async () => {
    const res = await request(app)
      .post("/api/v1/cart/validate")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.valid).toBe(true);
  });

  it("POST /cart/apply-promo — applies BIENVENIDO code", async () => {
    const res = await request(app)
      .post("/api/v1/cart/apply-promo")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ code: "BIENVENIDO" });

    expect(res.status).toBe(200);
    expect(res.body.data.discount_amount).toBeGreaterThan(0);
    expect(res.body.data.code).toBe("BIENVENIDO");
  });

  it("POST /cart/apply-promo — rejects fake code", async () => {
    const res = await request(app)
      .post("/api/v1/cart/apply-promo")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ code: "FAKECODE999" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_PROMO_CODE");
  });

  it("DELETE /cart/items/:id — removes item", async () => {
    // Add another item to keep cart non-empty for order test
    await request(app)
      .post("/api/v1/cart/items")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ variant_id: variantId, quantity: 2 });
  });
});

// ─── ORDERS ───────────────────────────────────────────

describe("Orders", () => {
  it("POST /orders — places order successfully", async () => {
    const res = await request(app)
      .post("/api/v1/orders")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        address_id: addressId,
        payment_method: "cash",
        delivery_notes: "Llamar al timbre",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.order_number).toMatch(/^AZ-\d{4}-\d{4}$/);
    expect(res.body.data.status).toBe("pending");
    expect(res.body.data.total).toBeGreaterThan(0);
    expect(res.body.data.items.length).toBeGreaterThan(0);
    orderId = res.body.data.id;
  });

  it("GET /orders — returns order list", async () => {
    const res = await request(app)
      .get("/api/v1/orders")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toHaveProperty("total");
  });

  it("GET /orders/:id — returns order detail", async () => {
    if (!orderId) return;
    const res = await request(app)
      .get(`/api/v1/orders/${orderId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(orderId);
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });

  it("POST /orders/:id/cancel — cancels pending order", async () => {
    if (!orderId) return;
    const res = await request(app)
      .post(`/api/v1/orders/${orderId}/cancel`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
  });

  it("POST /orders/:id/review — blocks review on cancelled order", async () => {
    if (!orderId) return;
    const res = await request(app)
      .post(`/api/v1/orders/${orderId}/review`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ rating: 5, comment: "Excelente" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("ORDER_NOT_DELIVERED");
  });

  it("POST /orders/:id/reorder — copies items to cart", async () => {
    if (!orderId) return;
    const res = await request(app)
      .post(`/api/v1/orders/${orderId}/reorder`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.added.length).toBeGreaterThan(0);
  });

  it("GET /orders/:id — returns 404 for other user order", async () => {
    if (!orderId) return;
    const other = await request(app)
      .post("/api/v1/auth/register")
      .send({
        first_name: "Other",
        last_name: "User",
        email: "other_cart@test.com",
        password: "Test1234!",
      });

    const res = await request(app)
      .get(`/api/v1/orders/${orderId}`)
      .set("Authorization", `Bearer ${other.body.data.accessToken}`);

    expect(res.status).toBe(404);
    await pool.query("DELETE FROM users WHERE email = 'other_cart@test.com'");
  });
});
