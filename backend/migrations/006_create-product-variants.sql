CREATE TABLE product_variants (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label        VARCHAR(50) NOT NULL,
  weight_grams INTEGER NOT NULL,
  price        NUMERIC(10,2) NOT NULL,
  stock_qty    INTEGER NOT NULL DEFAULT 0,
  sku          VARCHAR(100) UNIQUE,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order   SMALLINT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT positive_stock  CHECK (stock_qty >= 0),
  CONSTRAINT positive_price  CHECK (price > 0),
  CONSTRAINT positive_weight CHECK (weight_grams > 0)
);

CREATE INDEX idx_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_variants_is_active  ON product_variants(is_active);
CREATE INDEX idx_variants_sku        ON product_variants(sku);
