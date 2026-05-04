-- Pricing/UX fields to support the Apple-minimal frontend rebuild.
--
-- product_variants:
--   compare_at_price    — anchor "antes" price for strikethrough display
--   low_stock_threshold — when stock_qty <= threshold, frontend shows "Quedan X"
--   badge_label         — free-text promo tag ("Oferta", "Nuevo", "Solo hoy")
--
-- products:
--   unit_label_override — optional pack-level label shown above variants
--                         ("Pack familiar", "Bandeja 4 filetes"). Distinct
--                         from per-variant label (e.g. "500g", "1kg").

ALTER TABLE product_variants
  ADD COLUMN compare_at_price    NUMERIC(10,2) NULL,
  ADD COLUMN low_stock_threshold SMALLINT NULL,
  ADD COLUMN badge_label         VARCHAR(40) NULL;

ALTER TABLE product_variants
  ADD CONSTRAINT compare_at_price_positive
    CHECK (compare_at_price IS NULL OR compare_at_price > 0),
  ADD CONSTRAINT low_stock_threshold_nonneg
    CHECK (low_stock_threshold IS NULL OR low_stock_threshold >= 0);

ALTER TABLE products
  ADD COLUMN unit_label_override VARCHAR(60) NULL;
