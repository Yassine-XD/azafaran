import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, ShoppingCart, Percent, Grid } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { api } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { useLang } from "@/contexts/LanguageContext";
import type { Product, Category } from "@/lib/types";
import { getProductImage, getMinPrice } from "@/lib/types";
import { Chip, ProductCard } from "@/components/ui";
import { brand, shadows } from "@/theme";

export default function ShopScreen() {
  const router = useRouter();
  const { t } = useLang();
  const { category, categoryName } = useLocalSearchParams<{
    category: string;
    categoryName: string;
  }>();
  const { itemCount, addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(category || null);
  const [showDiscounts, setShowDiscounts] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await api.get<Category[]>("/categories/", false);
      if (res.success && res.data) setCategories(res.data);
    })();
  }, []);

  const fetchProducts = useCallback(async () => {
    const path = activeCategory
      ? `/categories/${activeCategory}/products?limit=50`
      : "/products/?limit=50";
    const res = await api.get<Product[]>(path, false);
    if (res.success && res.data) setProducts(res.data);
    setIsLoading(false);
  }, [activeCategory]);

  useEffect(() => {
    setIsLoading(true);
    fetchProducts();
  }, [fetchProducts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    if (!showDiscounts) return products;
    return products.filter((p) =>
      p.variants?.some((v) => v.compare_at_price && v.compare_at_price > Number(v.price)),
    );
  }, [products, showDiscounts]);

  const handleCategoryFilter = (slug: string | null) => {
    setActiveCategory(slug);
    setShowDiscounts(false);
  };

  const handleAddToCart = async (product: Product) => {
    const variant = product.variants?.[0];
    if (variant) {
      await addItem(variant.id, 1, {
        product_name: product.name,
        product_image: product.images?.[0]?.url,
        weight_label: variant.label,
        price: variant.price,
      });
    }
  };

  const activeName =
    activeCategory && categories.find((c) => c.slug === activeCategory)?.name
      ? categories.find((c) => c.slug === activeCategory)?.name
      : categoryName || t("shop.title");

  if (isLoading && products.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={brand.burgundy[600]} />
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="light-content" />

      {/* Burgundy header */}
      <SafeAreaView edges={["top"]} className="bg-primary">
        <View className="px-5 pt-2 pb-5">
          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={() => router.back()}
              className="w-11 h-11 rounded-full bg-white/15 items-center justify-center"
              hitSlop={6}
            >
              <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2.4} />
            </Pressable>

            <View className="flex-1 items-center px-3">
              <Text className="font-body-semibold text-[11px] uppercase tracking-[3px] text-white/70">
                Azafarán
              </Text>
              <Text
                className="font-display text-[22px] leading-7 text-white mt-0.5"
                numberOfLines={1}
              >
                {activeName}
              </Text>
            </View>

            <Pressable
              onPress={() => router.push("/cart")}
              className="w-11 h-11 rounded-full bg-white/15 items-center justify-center relative"
              hitSlop={6}
            >
              <ShoppingCart size={20} color="#FFFFFF" strokeWidth={2.2} />
              {itemCount > 0 && (
                <View
                  className="absolute -top-1 -right-1 min-w-[20px] h-5 rounded-full bg-gold items-center justify-center px-1"
                >
                  <Text className="text-coal text-[10px] font-body-bold">{itemCount}</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      {/* Filter bar */}
      <View
        className="bg-card pt-3 pb-3 border-b border-border"
        style={shadows.card}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          <Chip
            label={t("shop.all")}
            icon={
              <Grid
                size={12}
                color={!activeCategory && !showDiscounts ? "#FFFFFF" : brand.textSecondary}
                strokeWidth={2.4}
              />
            }
            active={!activeCategory && !showDiscounts}
            onPress={() => handleCategoryFilter(null)}
          />
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              label={cat.name}
              active={activeCategory === cat.slug && !showDiscounts}
              onPress={() => handleCategoryFilter(cat.slug)}
            />
          ))}
          <Chip
            label={t("shop.deals")}
            tone="wine"
            icon={
              <Percent
                size={12}
                color={showDiscounts ? "#FFFFFF" : "#B91C1C"}
                strokeWidth={2.6}
              />
            }
            active={showDiscounts}
            onPress={() => setShowDiscounts(!showDiscounts)}
          />
        </ScrollView>

        <View className="px-5 mt-3 flex-row items-center justify-between">
          <Text className="font-body-medium text-xs text-muted-foreground">
            {filteredProducts.length} {t("shop.results")}
          </Text>
          {isLoading && products.length > 0 && (
            <ActivityIndicator size="small" color={brand.burgundy[600]} />
          )}
        </View>
      </View>

      {/* Grid */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={brand.burgundy[600]} />
        }
      >
        {filteredProducts.length === 0 ? (
          <View className="items-center justify-center py-24">
            <Text className="font-display text-xl text-foreground mb-2">
              {showDiscounts ? t("shop.empty_deals") : t("shop.empty")}
            </Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap" style={{ gap: 12 }}>
            {filteredProducts.map((item) => {
              const isDeal = item.variants?.some(
                (v) => v.compare_at_price && v.compare_at_price > Number(v.price),
              );
              const firstVariant = item.variants?.[0];
              const compareAt =
                firstVariant?.compare_at_price && firstVariant.compare_at_price > Number(firstVariant.price)
                  ? firstVariant.compare_at_price
                  : undefined;
              return (
                <View key={item.id} style={{ width: "48.5%" }}>
                  <ProductCard
                    width="full"
                    image={getProductImage(item)}
                    name={item.name}
                    category={item.category_name}
                    price={getMinPrice(item)}
                    compareAt={compareAt}
                    isDeal={isDeal}
                    isPack={item.unit_type === "pack"}
                    rating={item.avg_rating ?? null}
                    onPress={() =>
                      router.push({ pathname: "/product-detail", params: { id: item.id } })
                    }
                    onAdd={() => handleAddToCart(item)}
                  />
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
