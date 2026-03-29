import request from "supertest";
import app from "../../app";
import { pool } from "../config/database";

// We need a product + variant in DB to test against
// These will be seeded in beforeAll and cleaned up in afterAll

let productId: string;
let variantId: string;

const seedProduct = async () => {
  // Get cordero category id
  const { rows: cats } = await pool.query(
    "SELECT id FROM categories WHERE slug = 'cordero'",
  );
  const categoryId = cats[0]?.id;
  if (!categoryId)
    throw new Error("Cordero category not found — run migrations first");

  // Insert product
  const { rows: products } = await pool.query(
    `INSERT INTO products
       (id, category_id, name, slug, description, price_per_kg,
        halal_cert_id, halal_cert_body, is_active, is_featured)
     VALUES
       (gen_random_uuid(), $1, 'Pierna de Cordero Test', 'pierna-cordero-test',
        'Pierna de cordero halal certificada', 8.50,
        'CICEM-TEST-001', 'CICEM', true, true)
     RETURNING id`,
    [categoryId],
  );
  productId = products[0].id;

  // Insert variant
  const { rows: variants } = await pool.query(
    `INSERT INTO product_variants
       (id, product_id, label, weight_grams, price, stock_qty, sku, is_active, sort_order)
     VALUES
       (gen_random_uuid(), $1, '500g', 500, 4.25, 50, 'TEST-CORDERO-500G', true, 1)
     RETURNING id`,
    [productId],
  );
  variantId = variants[0].id;
};

const cleanSeed = async () => {
  await pool.query("DELETE FROM product_variants WHERE sku = $1", [
    "TEST-CORDERO-500G",
  ]);
  await pool.query("DELETE FROM products WHERE slug = 'pierna-cordero-test'");
};

beforeAll(async () => {
  await seedProduct();
});
afterAll(async () => {
  await cleanSeed();
  await pool.end();
});

// ─── CATEGORIES ───────────────────────────────────────

describe("GET /api/v1/categories", () => {
  it("returns all active categories", async () => {
    const res = await request(app).get("/api/v1/categories");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(6); // seeded in migration
    expect(res.body.data[0]).toHaveProperty("slug");
    expect(res.body.data[0]).toHaveProperty("name");
  });

  it("returns categories in display order", async () => {
    const res = await request(app).get("/api/v1/categories");
    const cats = res.body.data;
    // display_order should be ascending
    for (let i = 1; i < cats.length; i++) {
      expect(cats[i].display_order).toBeGreaterThanOrEqual(
        cats[i - 1].display_order,
      );
    }
  });
});

describe("GET /api/v1/categories/:slug/products", () => {
  it("returns products for a valid category", async () => {
    const res = await request(app).get("/api/v1/categories/cordero/products");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toHaveProperty("total");
    expect(res.body.meta).toHaveProperty("total_pages");
  });

  it("returns 404 for unknown category", async () => {
    const res = await request(app).get(
      "/api/v1/categories/unknown-cat/products",
    );
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("CATEGORY_NOT_FOUND");
  });

  it("paginates correctly", async () => {
    const res = await request(app).get(
      "/api/v1/categories/cordero/products?page=1&limit=1",
    );

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(1);
    expect(res.body.meta.limit).toBe(1);
  });
});

// ─── PRODUCTS ─────────────────────────────────────────

describe("GET /api/v1/products", () => {
  it("returns paginated product list", async () => {
    const res = await request(app).get("/api/v1/products");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toHaveProperty("total");
    expect(res.body.meta).toHaveProperty("page");
  });

  it("filters by category", async () => {
    const res = await request(app).get("/api/v1/products?category=cordero");

    expect(res.status).toBe(200);
    res.body.data.forEach((p: any) => {
      expect(p.category_slug).toBe("cordero");
    });
  });

  it("sorts by price ascending", async () => {
    const res = await request(app).get("/api/v1/products?sort=price&order=asc");

    expect(res.status).toBe(200);
    const prices = res.body.data.map((p: any) => p.price_per_kg);
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
    }
  });

  it("returns prices as numbers not strings", async () => {
    const res = await request(app).get("/api/v1/products");
    expect(res.status).toBe(200);
    if (res.body.data.length > 0) {
      expect(typeof res.body.data[0].price_per_kg).toBe("number");
    }
  });

  it("returns 400 on invalid limit", async () => {
    const res = await request(app).get("/api/v1/products?limit=999");
    expect(res.status).toBe(400);
  });
});

describe("GET /api/v1/products/featured", () => {
  it("returns featured and bestsellers", async () => {
    const res = await request(app).get("/api/v1/products/featured");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("featured");
    expect(res.body.data).toHaveProperty("bestsellers");
    expect(Array.isArray(res.body.data.featured)).toBe(true);
    expect(Array.isArray(res.body.data.bestsellers)).toBe(true);
  });
});

describe("GET /api/v1/products/search", () => {
  it("returns results for valid query", async () => {
    const res = await request(app).get("/api/v1/products/search?q=cordero");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("returns 400 for short query", async () => {
    const res = await request(app).get("/api/v1/products/search?q=a");

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("QUERY_TOO_SHORT");
  });
});

describe("GET /api/v1/products/:id", () => {
  it("returns product with variants", async () => {
    const res = await request(app).get(`/api/v1/products/${productId}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(productId);
    expect(res.body.data).toHaveProperty("variants");
    expect(Array.isArray(res.body.data.variants)).toBe(true);
    expect(res.body.data.variants.length).toBeGreaterThan(0);
    expect(res.body.data).toHaveProperty("halal_cert_id");
    expect(res.body.data).toHaveProperty("category_name");
  });

  it("returns 404 for unknown product", async () => {
    const res = await request(app).get(
      "/api/v1/products/00000000-0000-0000-0000-000000000000",
    );

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("PRODUCT_NOT_FOUND");
  });

  it("returns 400 for invalid uuid", async () => {
    const res = await request(app).get("/api/v1/products/not-a-uuid");

    expect(res.status).toBe(400);
  });

  it("returns prices as numbers", async () => {
    const res = await request(app).get(`/api/v1/products/${productId}`);

    expect(typeof res.body.data.price_per_kg).toBe("number");
    expect(typeof res.body.data.variants[0].price).toBe("number");
  });
});

describe("GET /api/v1/products/:id/variants", () => {
  it("returns variants with stock info", async () => {
    const res = await request(app).get(
      `/api/v1/products/${productId}/variants`,
    );

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0]).toHaveProperty("stock_qty");
    expect(res.body.data[0]).toHaveProperty("weight_grams");
    expect(res.body.data[0]).toHaveProperty("price");
  });

  it("returns 404 if product not found", async () => {
    const res = await request(app).get(
      "/api/v1/products/00000000-0000-0000-0000-000000000000/variants",
    );

    expect(res.status).toBe(404);
  });
});
