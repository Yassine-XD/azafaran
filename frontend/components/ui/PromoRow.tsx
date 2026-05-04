import React from "react";
import { View, Text, Pressable } from "react-native";
import { Tag } from "lucide-react-native";
import { brand, shadows } from "@/theme";
import type { Promotion } from "@/lib/types";

type Props = {
  promo: Promotion & { code?: string };
  onPress?: () => void;
};

/**
 * Single coupon-style row — gold tag icon, title + description, dashed
 * code chip on the right that copies / applies the promo when tapped.
 */
export function PromoRow({ promo, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 p-4 bg-card border border-border rounded-2xl"
      style={shadows.card}
    >
      <View className="w-12 h-12 rounded-xl bg-primary/10 items-center justify-center">
        <Tag size={20} color={brand.burgundy[600]} strokeWidth={2.2} />
      </View>
      <View className="flex-1 min-w-0">
        <Text className="font-body-bold text-sm text-foreground" numberOfLines={1}>
          {promo.title}
        </Text>
        {promo.description && (
          <Text className="font-body text-xs text-muted-foreground" numberOfLines={1}>
            {promo.description}
          </Text>
        )}
      </View>
      {promo.code && (
        <View className="border border-dashed border-primary px-3 py-1.5 rounded-lg">
          <Text className="font-body-bold text-[11px] text-primary">{promo.code}</Text>
        </View>
      )}
    </Pressable>
  );
}

export default PromoRow;
