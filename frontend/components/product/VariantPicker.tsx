import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/cva";

interface Variant {
  id: string;
  label: string;
  weight_grams: number;
  price: number;
  compare_at_price: number | null;
  stock_qty: number;
  is_active: boolean;
}

interface Props {
  variants: Variant[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  className?: string;
}

export function VariantPicker({ variants, selectedId, onSelect, className }: Props) {
  return (
    <View className={cn("flex-row flex-wrap gap-2", className)}>
      {variants
        .filter((v) => v.is_active)
        .map((v) => {
          const selected = v.id === selectedId;
          const out = v.stock_qty <= 0;
          return (
            <Pressable
              key={v.id}
              onPress={() => !out && onSelect(v.id)}
              disabled={out}
              className={cn(
                "px-4 h-11 rounded-pill border items-center justify-center min-w-[64px]",
                selected
                  ? "bg-primary border-primary"
                  : "bg-card border-border",
                out && "opacity-40",
              )}
            >
              <Text
                className={cn(
                  "font-body-semibold text-small",
                  selected ? "text-primary-foreground" : "text-foreground",
                )}
              >
                {v.label}
              </Text>
            </Pressable>
          );
        })}
    </View>
  );
}
