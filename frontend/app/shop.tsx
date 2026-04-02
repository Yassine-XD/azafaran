import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, ScrollView, FlatList, Image, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Search, ShoppingCart, Heart, Minus, Plus, Percent, Grid } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { api } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import type { Product, Category } from "@/lib/types";

export default function ShopScreen() {
  const router = useRouter();
  const { category, categoryName } = useLocalSearchParams<{ category: string; categoryName: string }>();
  const { itemCount, addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(category || null);
  const [showDiscounts, setShowDiscounts] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all categories for filter chips
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

  // Filter products by discount (has compare_at_price on any variant)
  const filteredProducts = useMemo(() => {
    if (!showDiscounts) return products;
    return products.filter((p) =>
      p.variants?.some((v) => v.compare_at_price && v.compare_at_price > Number(v.price))
    );
  }, [products, showDiscounts]);

  const handleCategoryFilter = (slug: string | null) => {
    setActiveCategory(slug);
    setShowDiscounts(false);
  };

  const handleAddToCart = async (product: Product) => {
    // Add the first available variant
    const variant = product.variants?.[0];
    if (variant) {
      await addItem(variant.id, 1, {
        product_name: product.name,
        product_image: product.image_url,
        weight_label: variant.weight_label,
        price: Number(variant.price),
      });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#660710" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="bg-primary px-4 pt-2 pb-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-primary-foreground/20 rounded-xl items-center justify-center"
          >
            <ArrowLeft size={22} className="text-primary-foreground" />
          </TouchableOpacity>

          <Text className="text-xl font-bold text-primary-foreground">
            {activeCategory ? categories.find((c) => c.slug === activeCategory)?.name || categoryName : "Productos"}
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/cart")}
            className="w-10 h-10 bg-primary-foreground/20 rounded-xl items-center justify-center relative"
          >
            <ShoppingCart size={20} className="text-primary-foreground" />
            {itemCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-white w-5 h-5 rounded-full items-center justify-center">
                <Text className="text-primary text-xs font-bold">{itemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Bar */}
      <View className="bg-background border-b border-border">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10, gap: 8 }}
        >
          {/* All products chip */}
          <TouchableOpacity
            onPress={() => handleCategoryFilter(null)}
            className={`flex-row items-center px-3.5 py-2 rounded-full border ${
              !activeCategory && !showDiscounts
                ? "bg-primary border-primary"
                : "bg-background border-border"
            }`}
          >
            <Grid size={14} className={!activeCategory && !showDiscounts ? "text-primary-foreground" : "text-muted-foreground"} />
            <Text className={`ml-1.5 text-xs font-medium ${
              !activeCategory && !showDiscounts ? "text-primary-foreground" : "text-foreground"
            }`}>
              Todos
            </Text>
          </TouchableOpacity>

          {/* Category chips */}
          {categories.map((cat) => {
            const isActive = activeCategory === cat.slug && !showDiscounts;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => handleCategoryFilter(cat.slug)}
                className={`px-3.5 py-2 rounded-full border ${
                  isActive ? "bg-primary border-primary" : "bg-background border-border"
                }`}
              >
                <Text className={`text-xs font-medium ${isActive ? "text-primary-foreground" : "text-foreground"}`}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Discount chip */}
          <TouchableOpacity
            onPress={() => setShowDiscounts(!showDiscounts)}
            className={`flex-row items-center px-3.5 py-2 rounded-full border ${
              showDiscounts ? "bg-red-500 border-red-500" : "bg-background border-border"
            }`}
          >
            <Percent size={14} className={showDiscounts ? "text-white" : "text-red-500"} />
            <Text className={`ml-1.5 text-xs font-medium ${showDiscounts ? "text-white" : "text-red-500"}`}>
              Ofertas
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Results count */}
        <View className="px-4 pb-2">
          <Text className="text-muted-foreground text-xs">{filteredProducts.length} productos</Text>
        </View>
      </View>

      {/* Product Grid */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 8, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ea580c" />}
      >
        {filteredProducts.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Text className="text-muted-foreground text-lg">
              {showDiscounts ? "No hay ofertas disponibles" : "No hay productos disponibles"}
            </Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap">
            {filteredProducts.map((item) => (
              <View key={item.id} className="w-1/2">
                <TouchableOpacity
                  onPress={() => router.push({ pathname: "/product-detail", params: { id: item.id } })}
                  className="flex-1 m-2 bg-card rounded-2xl overflow-hidden shadow-sm border border-border"
                >
                  <View className="relative">
                    <Image
                      source={{ uri: item.image_url || "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400" }}
                      className="w-full h-36"
                      resizeMode="cover"
                    />
                    {item.variants?.some((v) => v.compare_at_price && v.compare_at_price > Number(v.price)) && (
                      <View className="absolute top-2 left-2 bg-red-500 px-2 py-0.5 rounded-full">
                        <Text className="text-white text-[10px] font-bold">OFERTA</Text>
                      </View>
                    )}
                  </View>
                  <View className="p-3">
                    <Text className="text-foreground font-semibold text-sm mb-0.5" numberOfLines={2}>
                      {item.name}
                    </Text>
                    {item.category_name && (
                      <Text className="text-muted-foreground text-xs mb-2">{item.category_name}</Text>
                    )}
                    <View className="flex-row items-center justify-between">
                      <Text className="text-primary font-bold text-lg">
                        €{item.price_per_kg ? Number(item.price_per_kg).toFixed(2) : "0.00"}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleAddToCart(item)}
                        className="w-8 h-8 bg-primary rounded-full items-center justify-center"
                      >
                        <Plus size={18} className="text-primary-foreground" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
