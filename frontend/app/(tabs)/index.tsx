import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ImageBackground,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronRight,
  MapPin,
  Clock,
  Star,
  ShoppingCart,
  Search,
  Beef,
  Drumstick,
  Bird,
  Rabbit,
  Sandwich,
  Flame,
  BookOpen,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { api } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import type { Category, Product, Banner } from "@/lib/types";
import { getProductImage, getMinPrice } from "@/lib/types";

const CATEGORY_ICONS: Record<string, any> = {
  ternera: Beef,
  cordero: Drumstick,
  pollo: Bird,
  conejo: Rabbit,
  elaborados: Sandwich,
  "bbq-packs": Flame,
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
  const packsCategory = categories.find((c) => c.slug === "bbq-packs");
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
    if (bannerRes.success && bannerRes.data) setBanners(bannerRes.data as Banner[]);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleBannerPress = (banner: Banner) => {
    router.push({ pathname: "/article", params: { id: banner.id } });
  };

  const renderBanner = ({ item, index }: { item: Banner; index: number }) => (
    <TouchableOpacity
      className="mr-4 rounded-2xl overflow-hidden shadow-lg"
      onPress={() => handleBannerPress(item)}
      activeOpacity={0.7}
    >
      <ImageBackground
        source={{uri: item.image_url}}
        
        style={{
          height: 180,
          borderRadius: 16,
          padding: 20,
          justifyContent: "space-between",
          backgroundColor: 'rgba(0,0,0,1)'
        }}
      >
        <LinearGradient
        colors={[ "rgba(0,0,0,0.7)","transparent"]}
        style={{
          ...StyleSheet.absoluteFillObject,
        }}
      />
        
        <View 
          style={{
            width: "90%"
          }}
        >
          <Text className="text-white text-2xl font-bold">{item.title}</Text>
          {item.subtitle && (
            <Text className="text-white/80 text-sm mt-1">{item.subtitle}</Text>
          )}
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }: { item: Category }) => {
    const IconComponent = CATEGORY_ICONS[item.slug] || Beef;
    return (
      <TouchableOpacity
        className="items-center mr-4"
        onPress={() =>
          router.push({
            pathname: "/shop",
            params: { category: item.slug, categoryName: item.name },
          })
        }
      >
        <View className="w-16 h-16 rounded-full bg-orange-100 items-center justify-center mb-2">
          <IconComponent size={28} color="#ea580c" />
        </View>
        <Text className="text-xs text-foreground font-medium">{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({ pathname: "/product-detail", params: { id: item.id } })
      }
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
            <Text className="text-primary-foreground text-xs font-bold">
              DESTACADO
            </Text>
          </View>
        )}
        <TouchableOpacity className="absolute bottom-2 right-2 bg-background rounded-full p-2 shadow-md">
          <ShoppingCart size={18} className="text-foreground" />
        </TouchableOpacity>
      </View>
      <View className="p-3">
        <Text
          className="text-foreground font-semibold text-sm mb-1"
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <View className="flex-row items-center mb-2">
          {item.avg_rating ? (
            <>
              <Star size={12} className="text-yellow-500 mr-1" fill="#eab308" />
              <Text className="text-xs text-muted-foreground">
                {Number(item.avg_rating).toFixed(1)}
              </Text>
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
            <Text className="text-xs text-muted-foreground">
              {item.category_name}
            </Text>
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
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["top", "left", "right"]}
    >
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
          <TouchableOpacity
              onPress={() => router.push("/cart")}
              className="relative"
            >
              <ShoppingCart size={24} className="text-foreground" />
              {itemCount > 0 && (
                <View className="absolute -top-1 -right-1 bg-primary w-5 h-5 rounded-full items-center justify-center">
                  <Text className="text-primary-foreground text-[10px] font-bold">
                    {itemCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity onPress={() => router.push("/search")} className="flex-row items-center bg-input rounded-xl px-4 py-3">
          <Search size={20} className="text-muted-foreground mr-3" />
          <Text className="text-muted-foreground">
            Buscar carnes, ofertas...
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 128 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ea580c"
          />
        }
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
        {/* Hidden for test reason */}
        {/* {categories.length > 0 && (
          <View className="mb-6">
            <View className="px-6 flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-foreground">
                Categorías
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/categories")}
                className="flex-row items-center"
              >
                <Text className="text-sm text-primary font-medium">
                  Ver todo
                </Text>
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
        )} */}

        {/* Featured Products */}
        {featured.length > 0 && (
          <View className="mb-6">
            <View className="px-6 flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-foreground">
                Destacados
              </Text>
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
          <CategoryProductsSection
            key={cat.id}
            category={cat}
            router={router}
          />
        ))}

        {/* Packs Section */}
        <PacksSection router={router} category={packsCategory} />

        {/* Recipes Section */}
        <RecipesSection banners={banners} onPress={handleBannerPress} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Packs section — fetches bbq-packs category products
function PacksSection({ router, category }: { router: any; category?: Category }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!category) return;
    (async () => {
      const res = await api.get<Product[]>(`/categories/${category.slug}/products?limit=6`, false);
      if (res.success && res.data) setProducts(res.data);
    })();
  }, [category]);

  if (!category || products.length === 0) return null;

  return (
    <View className="mb-6">
      <View className="px-6 flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <Flame size={22} color="#ea580c" />
          <Text className="text-xl font-bold text-foreground">Packs</Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            router.push({ pathname: "/shop", params: { category: "bbq-packs", categoryName: "Packs" } })
          }
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
            className=" w-96 mr-4 bg-card rounded-2xl overflow-hidden shadow-sm border border-border"
          >
            <Image
              source={{ uri: item.images[0] }}
              className="w-full h-32"
              resizeMode="cover"
            />
            <View className="p-3">
              <Text className="text-foreground font-semibold text-sm mb-1" numberOfLines={1}>
                {item.name}
              </Text>
              <Text className="text-primary font-bold">€{getMinPrice(item)}</Text>
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

// Recipes section — filters banners with link_type "recipe"
function RecipesSection({
  banners,
  onPress,
}: {
  banners: Banner[];
  onPress: (b: Banner) => void;
}) {
  const recipes = banners.filter((b) => b.link_type === "recipe");
  if (recipes.length === 0) return null;

  return (
    <View className="mb-6">
      <View className="px-6 flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <BookOpen size={22} color="#ea580c" />
          <Text className="text-xl font-bold text-foreground">Recetas</Text>
        </View>
      </View>
      <FlatList
        data={recipes}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => onPress(item)}
            className="w-64 mr-4 bg-card rounded-2xl overflow-hidden shadow-sm border border-border"
          >
            {item.image_url ? (
              <Image source={{ uri: item.image_url }} className="w-full h-36" resizeMode="cover" />
            ) : (
              <LinearGradient
                colors={["#ea580c", "#c2410c"]}
                style={{ height: 144, justifyContent: "center", alignItems: "center" }}
              >
                <BookOpen size={40} color="#fff" />
              </LinearGradient>
            )}
            <View className="p-3">
              <Text className="text-foreground font-semibold text-sm" numberOfLines={2}>
                {item.title}
              </Text>
              {item.subtitle && (
                <Text className="text-muted-foreground text-xs mt-1" numberOfLines={1}>
                  {item.subtitle}
                </Text>
              )}
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

// Sub-component to load products per category
function CategoryProductsSection({
  category,
  router,
}: {
  category: Category;
  router: any;
}) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    (async () => {
      const res = await api.get<Product[]>(
        `/categories/${category.slug}/products?limit=6`,
        false,
      );
      if (res.success && res.data) setProducts(res.data);
    })();
  }, [category.slug]);

  if (products.length === 0) return null;

  return (
    <View className="mb-6">
      <View className="px-6 flex-row items-center justify-between mb-4">
        <Text className="text-xl font-bold text-foreground">
          {category.name}
        </Text>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/shop",
              params: { category: category.slug, categoryName: category.name },
            })
          }
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
            onPress={() =>
              router.push({
                pathname: "/product-detail",
                params: { id: item.id },
              })
            }
            className="w-44 mr-4 bg-card rounded-2xl overflow-hidden shadow-sm border border-border"
          >
            <Image
              source={{ uri: getProductImage(item) }}
              className="w-full h-32"
              resizeMode="cover"
            />
            <View className="p-3">
              <Text
                className="text-foreground font-semibold text-sm mb-1"
                numberOfLines={1}
              >
                {item.name}
              </Text>
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
