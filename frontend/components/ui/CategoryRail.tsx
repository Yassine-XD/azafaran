import React from "react";
import { View, Text, Image, Pressable, ScrollView } from "react-native";
import { shadows } from "@/theme";
import type { Category } from "@/lib/types";

const SLUG_EMOJI: Record<string, string> = {
  beef: "🥩",
  ternera: "🥩",
  lamb: "🐑",
  cordero: "🐑",
  chicken: "🍗",
  pollo: "🍗",
  kebabs: "🍢",
  burgers: "🍔",
  hamburguesas: "🍔",
  turkey: "🦃",
  pavo: "🦃",
  "bbq-packs": "🔥",
  packs: "🔥",
  ofertas: "🏷️",
  deals: "🏷️",
};

type Props = {
  categories: Category[];
  onPress?: (category: Category) => void;
};

/**
 * Horizontal emoji-tile rail for category quick-access. Each tile is an
 * 80×80 image with a tiny emoji bottom-right and the localized name below.
 */
export function CategoryRail({ categories, onPress }: Props) {
  if (!categories?.length) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
    >
      {categories.map((c) => {
        const emoji = SLUG_EMOJI[c.slug] ?? "🍽️";
        return (
          <Pressable
            key={c.id}
            onPress={() => onPress?.(c)}
            className="items-center gap-2"
            style={{ width: 80 }}
            hitSlop={4}
          >
            <View
              className="w-20 h-20 rounded-2xl overflow-hidden bg-muted border border-border relative"
              style={shadows.card}
            >
              {c.image_url ? (
                <Image
                  source={{ uri: c.image_url }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : null}
              <View className="absolute inset-0 bg-coal/10" />
              <Text className="absolute bottom-1 right-1.5 text-base">{emoji}</Text>
            </View>
            <Text
              className="font-body-semibold text-xs text-foreground"
              numberOfLines={1}
            >
              {c.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export default CategoryRail;
