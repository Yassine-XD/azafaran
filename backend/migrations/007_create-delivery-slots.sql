CREATE TABLE delivery_slots (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date         DATE NOT NULL,
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL,
  max_orders   SMALLINT NOT NULL DEFAULT 10,
  booked_count SMALLINT NOT NULL DEFAULT 0,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_times    CHECK (end_time > start_time),
  CONSTRAINT valid_capacity CHECK (booked_count >= 0 AND booked_count <= max_orders),
  UNIQUE(date, start_time)
);

CREATE INDEX idx_delivery_slots_date      ON delivery_slots(date);
CREATE INDEX idx_delivery_slots_is_active ON delivery_slots(is_active);
