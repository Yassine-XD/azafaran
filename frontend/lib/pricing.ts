import type { Product, ProductVariant } from "./types";
import { getPricePerKg, isPerKgEligible } from "./types";

type DualPriceProps = {
  pricePerKg: number | null;
  compareAtPerKg: number | null;
  weightLabel: string | undefined;
  unitSuffix: string;
  perKgSuffix: string;
};

type T = (key: string) => string;

/**
 * Build the optional dual-price props for a product card / detail block.
 * Returns null per-kg fields when the product is a pack (per-kg meaningless)
 * or the variant has no usable weight, so callers can still render a single-
 * price layout transparently.
 */
export function buildDualPriceProps(
  product: Product,
  t: T,
  variant?: ProductVariant | null,
): DualPriceProps {
  const v = variant ?? product.variants?.[0] ?? null;
  const eligible = isPerKgEligible(product);

  const pricePerKg = eligible ? getPricePerKg(product, v) : null;
  const compareAtPerKg =
    eligible && v && v.compare_at_price && v.weight_grams > 0
      ? (Number(v.compare_at_price) / v.weight_grams) * 1000
      : null;

  const grams = v?.weight_grams ?? 0;
  const weightLabel =
    eligible && grams > 0
      ? `${t("home.weight_approx")} ${
          grams >= 1000 ? `${(grams / 1000).toFixed(1)} kg` : `${grams} g`
        }`
      : undefined;

  return {
    pricePerKg,
    compareAtPerKg,
    weightLabel,
    unitSuffix: t("home.per_unit_short"),
    perKgSuffix: t("home.per_kg_short"),
  };
}
