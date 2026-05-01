import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { Text } from "@/components/ui/Text";
import { Badge } from "@/components/ui/Badge";
import { PriceBlock, pricePerKg } from "./PriceBlock";
import { cn } from "@/lib/cva";

/**
 * Compact product card used on home, category, and search lists.
 *
 * Picks the cheapest active variant for the price headline so the user sees
 * the entry-point price first. Surfaces three psychological levers when the
 * data carries them: badge (promo), halal chip (trust), strikethrough anchor.
 */

interface Variant {
  id: string;
  label: string;
  weight_grams: number;
  price: number;
  compare_at_price: number | null;
  badge_label: string | null;
  stock_qty: number;
  low_stock_threshold: number | null;
  is_active: boolean;
}

interface Product {
  id: string;
  name: string;
  images?: string[];
  halal_cert_id?: string | null;
  unit_label_override?: string | null;
  variants?: Variant[];
}

interface Props {
  product: Product;
  onPress?: () => void;
  className?: string;
}

function pickHeadlineVariant(variants: Variant[] | undefined): Variant | null {
  if (!variants?.length) return null;
  const active = variants.filter((v) => v.is_active);
  if (!active.length) return null;
  // Prefer one with a promo badge; otherwise the cheapest unit.
  const promo = active.find((v) => v.badge_label || v.compare_at_price);
  if (promo) return promo;
  return active.slice().sort((a, b) => a.price - b.price)[0];
}

export function ProductCard({ product, onPress, className }: Props) {
  const v = pickHeadlineVariant(product.variants);
  const image = product.images?.[0];
  const showHalal = !!product.halal_cert_id;
  const showLowStock =
    v && v.low_stock_threshold != null && v.stock_qty <= v.low_stock_threshold;

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "rounded-2xl bg-card border border-border overflow-hidden active:opacity-90",
        className,
      )}
    >
      <View className="aspect-square w-full bg-muted relative">
        {image ? (
          <Image
            source={{ uri: image }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            transition={200}
          />
        ) : null}
        {v?.badge_label ? (
          <View className="absolute top-2 left-2">
            <Badge variant="promo" label={v.badge_label} />
          </View>
        ) : null}
        {showHalal ? (
          <View className="absolute top-2 right-2">
            <Badge variant="halal" label="Halal" />
          </View>
        ) : null}
      </View>

      <View className="p-3 gap-2">
        <Text variant="h3" numberOfLines={2}>
          {product.name}
        </Text>

        {v ? (
          <PriceBlock
            amount={v.price}
            unitLabel={product.unit_label_override || v.label}
            perKg={pricePerKg(v.price, v.weight_grams)}
            compareAt={v.compare_at_price}
            size="md"
          />
        ) : null}

        {showLowStock ? (
          <Text variant="caption" className="text-sale">
            Quedan {v!.stock_qty}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
