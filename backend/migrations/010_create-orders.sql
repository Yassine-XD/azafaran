CREATE TYPE order_status AS ENUM (
  'pending', 'confirmed', 'preparing',
  'shipped', 'delivered', 'cancelled', 'refunded'
);

CREATE TYPE payment_status AS ENUM (
  'pending', 'paid', 'failed', 'refunded'
);

CREATE TYPE payment_method_type AS ENUM (
  'card', 'cash', 'bizum'
);

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

CREATE TABLE orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number     VARCHAR(20) NOT NULL UNIQUE DEFAULT (
                     'AZ-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
                     LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0')
                   ),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  address_id       UUID REFERENCES addresses(id) ON DELETE SET NULL,
  address_snapshot JSONB NOT NULL,
  status           order_status NOT NULL DEFAULT 'pending',
  payment_status   payment_status NOT NULL DEFAULT 'pending',
  payment_method   payment_method_type NOT NULL DEFAULT 'card',
  payment_ref      VARCHAR(200),
  subtotal         NUMERIC(10,2) NOT NULL,
  delivery_fee     NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_amount  NUMERIC(10,2) NOT NULL DEFAULT 0,
  total            NUMERIC(10,2) NOT NULL,
  promo_code_id    UUID REFERENCES promo_codes(id) ON DELETE SET NULL,
  delivery_slot_id UUID REFERENCES delivery_slots(id) ON DELETE SET NULL,
  delivery_notes   TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT positive_total CHECK (total >= 0)
);

CREATE INDEX idx_orders_user_id    ON orders(user_id);
CREATE INDEX idx_orders_status     ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_number     ON orders(order_number);
