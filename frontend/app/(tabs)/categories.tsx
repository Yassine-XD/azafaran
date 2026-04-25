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
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowRight, Search } from "lucide-react-native";
import { useRouter } from "expo-router";
import { api } from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";
import type { Category, Product } from "@/lib/types";
import { SectionHeader } from "@/components/ui";
import { brand, shadows } from "@/theme";

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
        // Fetch product counts for display (best effort).
        const pairs = await Promise.all(
          res.data.map(async (c) => {
            const pr = await api.get<Product[]>(`/categories/${c.slug}/products?limit=100`, false);
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

  const featured = categories.slice(0, 2);
  const rest = categories.slice(2);

  const open = (c: Category) =>
    router.push({ pathname: "/shop", params: { category: c.slug, categoryName: c.name } });

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="px-5 pt-2 pb-4">
        <Text className="font-body-semibold text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
          Azafarán
        </Text>
        <Text className="font-display text-[30px] leading-9 text-foreground">
          {t("categories.title")}
        </Text>
      </View>

      <View className="px-5 pb-4">
        <Pressable
          onPress={() => router.push("/search")}
          className="flex-row items-center gap-3 h-12 px-4 rounded-full bg-card"
          style={shadows.card}
        >
          <Search size={18} color={brand.textSecondary} strokeWidth={2.2} />
          <Text className="font-body text-[14px] text-muted-foreground">
            {t("categories.search_placeholder")}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 128, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Featured editorial cards — full width, tall */}
        {featured.length > 0 && (
          <View className="mb-6">
            <SectionHeader
              title={t("categories.featured")}
              accent="gold"
              className="mb-4"
            />
            <View className="gap-4">
              {featured.map((cat) => (
                <EditorialCard
                  key={cat.id}
                  category={cat}
                  count={counts[cat.slug] ?? 0}
                  countLabel={t("home.cuts")}
                  onPress={() => open(cat)}
                  tall
                />
              ))}
            </View>
          </View>
        )}

        {/* Grid of the rest */}
        {rest.length > 0 && (
          <View>
            <SectionHeader title={t("categories.all")} className="mb-4" />
            <View className="flex-row flex-wrap" style={{ gap: 14 }}>
              {rest.map((cat) => (
                <View key={cat.id} style={{ width: "47.8%" }}>
                  <EditorialCard
                    category={cat}
                    count={counts[cat.slug] ?? 0}
                    countLabel={t("home.cuts")}
                    onPress={() => open(cat)}
                  />
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function EditorialCard({
  category,
  count,
  countLabel,
  onPress,
  tall = false,
}: {
  category: Category;
  count: number;
  countLabel: string;
  onPress: () => void;
  tall?: boolean;
}) {
  const fallback =
    "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=900&auto=format&fit=crop&q=80";

  return (
    <Pressable onPress={onPress} style={shadows.cardLift} className="rounded-3xl overflow-hidden">
      <ImageBackground
        source={{ uri: category.image_url || fallback }}
        style={{ height: tall ? 220 : 200 }}
        imageStyle={{ backgroundColor: "#1A0F0F" }}
      >
        <LinearGradient
          colors={["rgba(26,15,15,0.05)", "rgba(26,15,15,0.35)", "rgba(26,15,15,0.92)"]}
          locations={[0, 0.45, 1]}
          style={{ flex: 1, justifyContent: "flex-end", padding: 18 }}
        >
          <View className="flex-row items-end justify-between">
            <View className="flex-1 pr-3">
              <Text className="font-body-semibold text-[11px] uppercase tracking-widest text-gold mb-1.5">
                {count} {countLabel}
              </Text>
              <Text
                className="font-display text-white text-[22px] leading-7"
                numberOfLines={2}
              >
                {category.name}
              </Text>
            </View>

            <View
              className="w-11 h-11 rounded-full bg-gold items-center justify-center"
              style={shadows.goldGlow}
            >
              <ArrowRight size={18} color="#1A0F0F" strokeWidth={2.4} />
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </Pressable>
  );
}
