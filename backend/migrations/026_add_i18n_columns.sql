-- Add multi-language JSONB columns to products, categories, and product_variants
-- Existing text columns are kept as the primary (Spanish) fallback.
-- name_i18n / description_i18n / short_desc_i18n / label_i18n hold translations
-- for all supported languages: { "es": "...", "ca": "...", "en": "..." }

-- ─── Products ─────────────────────────────────────────────────────────────────
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS name_i18n       JSONB,
  ADD COLUMN IF NOT EXISTS description_i18n JSONB,
  ADD COLUMN IF NOT EXISTS short_desc_i18n  JSONB;

-- Seed from existing Spanish content; ca/en start empty for admin to fill in
UPDATE products SET
  name_i18n        = jsonb_build_object('es', name,                         'ca', '', 'en', ''),
  description_i18n = jsonb_build_object('es', COALESCE(description, ''),    'ca', '', 'en', ''),
  short_desc_i18n  = jsonb_build_object('es', COALESCE(short_desc,  ''),    'ca', '', 'en', '');

-- ─── Categories ───────────────────────────────────────────────────────────────
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS name_i18n        JSONB,
  ADD COLUMN IF NOT EXISTS description_i18n JSONB;

UPDATE categories SET
  name_i18n        = jsonb_build_object('es', name,                      'ca', '', 'en', ''),
  description_i18n = jsonb_build_object('es', COALESCE(description, ''), 'ca', '', 'en', '');

-- ─── Product Variants ─────────────────────────────────────────────────────────
ALTER TABLE product_variants
  ADD COLUMN IF NOT EXISTS label_i18n JSONB;

-- Variant labels (e.g. "250g") are typically the same across languages;
-- pre-fill all three with the current label so they display correctly immediately.
UPDATE product_variants SET
  label_i18n = jsonb_build_object('es', label, 'ca', label, 'en', label);
