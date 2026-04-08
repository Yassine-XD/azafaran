-- Pack Items: junction table linking pack products to their contained products
CREATE TABLE IF NOT EXISTS pack_items (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id       UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_id    UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity      SMALLINT    NOT NULL DEFAULT 1,
  custom_label  VARCHAR(100),
  sort_order    SMALLINT    NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(pack_id, product_id),
  CHECK(quantity > 0),
  CHECK(pack_id != product_id)
);

CREATE INDEX IF NOT EXISTS idx_pack_items_pack_id ON pack_items(pack_id);
