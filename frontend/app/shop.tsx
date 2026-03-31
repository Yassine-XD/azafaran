import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, FlatList, Image, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Search, ShoppingCart, Heart, Minus, Plus } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { api } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/lib/types";

export default function ShopScreen() {
  const router = useRouter();
  const { category, categoryName } = useLocalSearchParams<{ category: string; categoryName: string }>();
  const { itemCount, addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = useCallback(async () => {
    const path = category
      ? `/categories/${category}/products?limit=50`
      : "/products/?limit=50";
    const res = await api.get<Product[]>(path, false);
    if (res.success && res.data) setProducts(res.data);
    setIsLoading(false);
  }, [category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  }, [fetchProducts]);

  const handleAddToCart = async (product: Product) => {
    // Add the first available variant
    const variant = product.variants?.[0];
    if (variant) {
      await addItem(variant.id, 1);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#ea580c" />
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
            {categoryName || "Productos"}
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

      {/* Results count */}
      <View className="px-4 py-3 bg-background border-b border-border">
        <Text className="text-muted-foreground text-sm">{products.length} productos</Text>
      </View>

      {/* Product Grid */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 8, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ea580c" />}
      >
        {products.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Text className="text-muted-foreground text-lg">No hay productos disponibles</Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap">
            {products.map((item) => (
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
                        €{item.min_price ? Number(item.min_price).toFixed(2) : "0.00"}
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
