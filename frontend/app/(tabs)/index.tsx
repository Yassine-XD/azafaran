import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, FlatList, Image, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronRight, MapPin, Clock, Star, ShoppingCart, Search } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useRouter } from "expo-router";
import { api } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import type { Category, Product, Banner } from "@/lib/types";
import { getProductImage, getMinPrice } from "@/lib/types";

const CATEGORY_ICONS: Record<string, string> = {
  ternera: "🥩",
  cordero: "🍖",
  pollo: "🐔",
  conejo: "🐰",
  elaborados: "🌭",
  "bbq-packs": "🔥",
};

const BANNER_GRADIENTS: string[][] = [
  ["#52270e", "#962204"],
  ["#ea580c", "#f97316"],
  ["#dc2626", "#ef4444"],
  ["#7c3aed", "#a78bfa"],
];

export default function HomeScreen() {
  const router = useRouter();
  const { itemCount } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    const [catRes, featRes, bannerRes] = await Promise.all([
      api.get<Category[]>("/categories/", false),
      api.get<Product[]>("/products/featured", false),
      api.get("/promotions/banners", false),
    ]);
    if (catRes.success && catRes.data) setCategories(catRes.data);
    if (featRes.success && featRes.data) setFeatured(featRes.data);
    if (bannerRes.success && bannerRes.data) setBanners(bannerRes.data);
    setIsLoading(false);
  console.log(bannerRes)

  }, []);


  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const renderBanner = ({ item, index }: { item: Banner; index: number }) => (
    <TouchableOpacity className=" mr-4 rounded-2xl overflow-hidden shadow-lg">
      <LinearGradient
        colors={item.bg_color ? [item.bg_color, item.bg_color] : BANNER_GRADIENTS[index % BANNER_GRADIENTS.length]}
        style={{ height: 180, borderRadius: 16, padding: 20, justifyContent: "space-between" }}
      >
        <View>
          <Text className="text-white text-2xl font-bold">{item.title}</Text>
          {item.subtitle && <Text className="text-white/80 text-sm mt-1">{item.subtitle}</Text>}
        </View>
        {/* {item.image_url && (
          <Image
            source={{ uri: item.image_url }}
            className="w-24 h-24 rounded-full absolute bottom-2 right-2 border-2 border-white/30"
            resizeMode="cover"
          />
        )} */}
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      className="items-center mr-4"
      onPress={() => router.push({ pathname: "/shop", params: { category: item.slug, categoryName: item.name } })}
    >
      <View className="w-16 h-16 rounded-full bg-orange-100 items-center justify-center mb-2">
        <Text className="text-2xl">{CATEGORY_ICONS[item.slug] || "🥩"}</Text>
      </View>
      <Text className="text-xs text-foreground font-medium">{item.name}</Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      onPress={() => router.push({ pathname: "/product-detail", params: { id: item.id } })}
      className="w-44 mr-4 bg-card rounded-2xl overflow-hidden shadow-sm border border-border"
    >
      <View className="relative">
        <Image
          source={{ uri: getProductImage(item) }}
          className="w-full h-32"
          resizeMode="cover"
        />
        {item.is_featured && (
          <View className="absolute top-2 left-2 bg-primary px-2 py-1 rounded-md">
            <Text className="text-primary-foreground text-xs font-bold">DESTACADO</Text>
          </View>
        )}
        <TouchableOpacity className="absolute bottom-2 right-2 bg-background rounded-full p-2 shadow-md">
          <ShoppingCart size={18} className="text-foreground" />
        </TouchableOpacity>
      </View>
      <View className="p-3">
        <Text className="text-foreground font-semibold text-sm mb-1" numberOfLines={1}>
          {item.name}
        </Text>
        <View className="flex-row items-center mb-2">
          {item.avg_rating ? (
            <>
              <Star size={12} className="text-yellow-500 mr-1" fill="#eab308" />
              <Text className="text-xs text-muted-foreground">{Number(item.avg_rating).toFixed(1)}</Text>
            </>
          ) : (
            <Text className="text-xs text-muted-foreground">Nuevo</Text>
          )}
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-primary font-bold">
            €{getMinPrice(item).toFixed(2)}
          </Text>
          {item.category_name && (
            <Text className="text-xs text-muted-foreground">{item.category_name}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#ea580c" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "left", "right"]}>
      {/* Header */}
      <View className="px-6 py-4">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <View className="flex-row items-center">
              <MapPin size={16} className="text-primary mr-1" />
              <Text className="text-sm text-muted-foreground">Entregar en</Text>
            </View>
            <Text className="text-lg font-bold text-foreground">
              {user ? `${user.first_name}, Barcelona` : "Barcelona"}
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.push("/cart")} className="relative">
              <ShoppingCart size={24} className="text-foreground" />
              {itemCount > 0 && (
                <View className="absolute -top-1 -right-1 bg-primary w-5 h-5 rounded-full items-center justify-center">
                  <Text className="text-primary-foreground text-[10px] font-bold">{itemCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <ThemeToggle />
          </View>
        </View>

        {/* Search Bar */}
        <TouchableOpacity className="flex-row items-center bg-input rounded-xl px-4 py-3">
          <Search size={20} className="text-muted-foreground mr-3" />
          <Text className="text-muted-foreground">Buscar carnes, ofertas...</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 128 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ea580c" />}
      >
        {/* Banner Carousel */}
        {banners.length > 0 && (
          <View className="mb-6">
            <FlatList
              data={banners}
              renderItem={renderBanner}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24 }}
            />
          </View>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <View className="mb-6">
            <View className="px-6 flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-foreground">Categorías</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/categories")} className="flex-row items-center">
                <Text className="text-sm text-primary font-medium">Ver todo</Text>
                <ChevronRight size={16} className="text-primary" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={categories}
              renderItem={renderCategory}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24 }}
            />
          </View>
        )}

        {/* Featured Products */}
        {featured.length > 0 && (
          <View className="mb-6">
            <View className="px-6 flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-foreground">Destacados</Text>
            </View>
            <FlatList
              data={featured}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24 }}
            />
          </View>
        )}

        {/* Products by Category */}
        {categories.slice(0, 3).map((cat) => (
          <CategoryProductsSection key={cat.id} category={cat} router={router} />
        ))}

        {/* Halal Banner */}
        <View className="px-6 mb-6">
          <LinearGradient
            colors={["#ea580c", "#c2410c"]}
            style={{ borderRadius: 16, padding: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
          >
            <View>
              <Text className="text-white text-2xl font-bold tracking-tight">FRESCA</Text>
              <Text className="text-white/90 text-lg">· HALAL ·</Text>
              <Text className="text-white text-xl font-bold tracking-tight">CERTIFICADA</Text>
            </View>
            <View className="bg-white/20 rounded-full p-3">
              <Text className="text-3xl">🏆</Text>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Sub-component to load products per category
function CategoryProductsSection({ category, router }: { category: Category; router: any }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    (async () => {
      const res = await api.get<Product[]>(`/categories/${category.slug}/products?limit=6`, false);
      if (res.success && res.data) setProducts(res.data);
    })();
  }, [category.slug]);

  if (products.length === 0) return null;

  return (
    <View className="mb-6">
      <View className="px-6 flex-row items-center justify-between mb-4">
        <Text className="text-xl font-bold text-foreground">{category.name}</Text>
        <TouchableOpacity
          onPress={() => router.push({ pathname: "/shop", params: { category: category.slug, categoryName: category.name } })}
          className="flex-row items-center"
        >
          <Text className="text-sm text-primary font-medium">Ver todo</Text>
          <ChevronRight size={16} className="text-primary" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={products}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push({ pathname: "/product-detail", params: { id: item.id } })}
            className="w-44 mr-4 bg-card rounded-2xl overflow-hidden shadow-sm border border-border"
          >
            <Image
              source={{ uri: getProductImage(item) }}
              className="w-full h-32"
              resizeMode="cover"
            />
            <View className="p-3">
              <Text className="text-foreground font-semibold text-sm mb-1" numberOfLines={1}>{item.name}</Text>
              <Text className="text-primary font-bold">
                €{getMinPrice(item)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24 }}
      />
    </View>
  );
}
