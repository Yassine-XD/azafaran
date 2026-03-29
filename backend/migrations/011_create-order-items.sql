CREATE TABLE order_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id       UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  product_snapshot JSONB NOT NULL,
  quantity         SMALLINT NOT NULL,
  unit_price       NUMERIC(10,2) NOT NULL,
  line_total       NUMERIC(10,2) NOT NULL,

  CONSTRAINT positive_quantity   CHECK (quantity > 0),
  CONSTRAINT positive_line_total CHECK (line_total >= 0)
);

CREATE INDEX idx_order_items_order_id   ON order_items(order_id);
CREATE INDEX idx_order_items_variant_id ON order_items(variant_id);
