import { View } from "react-native";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/cva";

/**
 * The unit-pricing-trick centerpiece.
 *
 * Big bold price = unit/pack ("2 entrecots €9,90"). Small grey line below =
 * legally-required price-per-kg ("€19,80/kg"). Optional strikethrough anchor
 * to the side when there's a real promo. Visual hierarchy is the lever; the
 * EU-mandated unit price (€/kg) stays present, just visually subordinate.
 *
 * Inputs are pre-resolved by the caller (variant.label, variant.price,
 * variant.weight_grams from the API). All formatting is local (es-ES).
 */

interface Props {
  // Required: the big, anchored unit price.
  amount: number; // e.g. 9.9
  unitLabel?: string | null; // e.g. "2 entrecots", "Pack familiar"
  // Required-ish: what the law requires us to show.
  perKg?: number | null; // computed €/kg, e.g. 19.8
  // Optional: anchor "antes" price for strikethrough.
  compareAt?: number | null;
  // Layout knobs.
  size?: "md" | "lg";
  align?: "start" | "end";
  className?: string;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

export function PriceBlock({
  amount,
  unitLabel,
  perKg,
  compareAt,
  size = "md",
  align = "start",
  className,
}: Props) {
  const hasAnchor = compareAt != null && compareAt > amount;
  return (
    <View
      className={cn(
        "gap-0.5",
        align === "end" && "items-end",
        className,
      )}
    >
      {unitLabel ? (
        <Text variant="micro" className="text-foreground/60">
          {unitLabel}
        </Text>
      ) : null}

      <View className="flex-row items-baseline gap-2">
        <Text
          className={cn(
            "font-mono-semibold text-foreground",
            size === "lg" ? "text-price-lg" : "text-price",
          )}
        >
          {fmt(amount)}
        </Text>

        {hasAnchor ? (
          <Text
            className="font-mono text-small text-sale line-through"
            style={{ textDecorationLine: "line-through" }}
          >
            {fmt(compareAt!)}
          </Text>
        ) : null}
      </View>

      {perKg != null && perKg > 0 ? (
        <Text variant="caption" className="text-muted-foreground">
          {fmt(perKg)}/kg
        </Text>
      ) : null}
    </View>
  );
}

/**
 * Helper: derive €/kg from a variant when the backend doesn't ship one.
 * Returns null if inputs are missing/invalid.
 */
export function pricePerKg(price: number, weightGrams: number | null | undefined): number | null {
  if (!weightGrams || weightGrams <= 0) return null;
  return (price / weightGrams) * 1000;
}
