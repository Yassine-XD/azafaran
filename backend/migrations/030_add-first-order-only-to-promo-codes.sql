-- Restrict promo codes to brand-new customers (no prior orders).
-- Validation lives in cart.service.ts:applyPromo: when first_order_only is true,
-- a user with any non-cancelled, non-refunded order is rejected with
-- PROMO_NEW_CUSTOMERS_ONLY.

ALTER TABLE promo_codes
  ADD COLUMN first_order_only BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE promo_codes SET first_order_only = TRUE WHERE code = 'BIENVENIDO';
