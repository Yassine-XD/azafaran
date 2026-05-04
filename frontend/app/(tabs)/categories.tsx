import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ImageBackground,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import { api } from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";
import type { Category, Product } from "@/lib/types";
import { Gradient } from "@/components/ui";
import { brand, shadows } from "@/theme";

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

type CategoryWithCount = Category & { product_count?: number };

export default function CategoriesScreen() {
  const router = useRouter();
  const { t, lang } = useLang();
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const res = await api.get<CategoryWithCount[]>("/categories/", false);
      if (res.success && res.data) {
        setCategories(res.data);
        const pairs = await Promise.all(
          res.data.map(async (c) => {
            const pr = await api.get<Product[]>(
              `/categories/${c.slug}/products?limit=100`,
              false,
            );
            return [c.slug, pr.success && pr.data ? pr.data.length : c.product_count ?? 0] as const;
          }),
        );
        setCounts(Object.fromEntries(pairs));
      }
      setIsLoading(false);
    })();
  }, [lang]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={brand.burgundy[600]} />
      </SafeAreaView>
    );
  }

  const open = (c: Category) =>
    router.push({
      pathname: "/shop",
      params: { category: c.slug, categoryName: c.name },
    });

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="pt-2 pb-5">
          <Text className="font-body text-sm text-muted-foreground">
            {t("categories.eyebrow")}
          </Text>
          <Text className="font-display text-3xl leading-9 text-foreground mt-0.5">
            {t("categories.title")}
          </Text>
        </View>

        {/* 2-col grid */}
        <View className="flex-row flex-wrap" style={{ gap: 12 }}>
          {categories.map((c, i) => (
            <View key={c.id} style={{ width: "47.8%" }}>
              <CategoryCard
                category={c}
                count={counts[c.slug] ?? 0}
                countLabel={t("categories.items")}
                onPress={() => open(c)}
                delayMs={i * 60}
              />
            </View>
          ))}
        </View>

        {/* Custom request CTA */}
        <View className="mt-5 rounded-3xl overflow-hidden" style={shadows.cardLift}>
          <Gradient name="gold" style={{ padding: 20 }}>
            <Text className="font-body-bold text-[10px] uppercase tracking-widest text-coal">
              {t("categories.custom_request_eyebrow")}
            </Text>
            <Text className="font-display text-coal text-xl leading-7 mt-1">
              {t("categories.custom_request_title")}
            </Text>
            <Text className="font-body text-coal/85 text-sm mt-1">
              {t("categories.custom_request_subtitle")}
            </Text>
            <Pressable
              onPress={() => router.push("/support-new")}
              className="self-start mt-3 bg-coal px-4 py-2 rounded-full"
            >
              <Text className="font-body-bold text-white text-sm">
                {t("categories.custom_request_cta")}
              </Text>
            </Pressable>
          </Gradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CategoryCard({
  category,
  count,
  countLabel,
  onPress,
  delayMs: _delayMs = 0,
}: {
  category: Category;
  count: number;
  countLabel: string;
  onPress: () => void;
  delayMs?: number;
}) {
  const emoji = SLUG_EMOJI[category.slug] ?? "🍽️";

  return (
    <Pressable
      onPress={onPress}
      style={[{ aspectRatio: 4 / 5 }, shadows.cardLift]}
      className="rounded-3xl overflow-hidden"
    >
      <ImageBackground
        source={category.image_url ? { uri: category.image_url } : undefined}
        style={{ flex: 1, backgroundColor: "#1A0F0F" }}
        imageStyle={{ resizeMode: "cover" }}
      >
        <Gradient name="overlay" style={{ flex: 1, padding: 14 }}>
          <View className="self-end">
            <Text className="text-3xl">{emoji}</Text>
          </View>
          <View className="flex-1" />
          <Text className="font-display text-white text-2xl leading-7" numberOfLines={2}>
            {category.name}
          </Text>
          <View className="flex-row items-center justify-between mt-1">
            <Text className="font-body text-white/85 text-xs">
              {count} {countLabel}
            </Text>
            <ChevronRight size={16} color="#FFFFFF" />
          </View>
        </Gradient>
      </ImageBackground>
    </Pressable>
  );
}
