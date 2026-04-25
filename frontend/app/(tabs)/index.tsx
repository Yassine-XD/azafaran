import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Image,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MapPin, ShoppingCart, Search, ChevronRight, BookOpen } from "lucide-react-native";
import { useRouter } from "expo-router";
import { api } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import type { Category, Product, Banner } from "@/lib/types";
import { getProductImage, getMinPrice } from "@/lib/types";
import {
  HeroBanner,
  SectionHeader,
  ProductCard,
  Card,
  HalalBadge,
} from "@/components/ui";
import { brand, shadows } from "@/theme";

export default function HomeScreen() {
  const router = useRouter();
  const { itemCount } = useCart();
  const { user } = useAuth();
  const { t, lang } = useLang();
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
    // `lang` triggers a refetch so localized API fields (category names, etc.) update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const openProduct = (id: string) =>
    router.push({ pathname: "/product-detail", params: { id } });

  const openShop = (slug?: string, name?: string) =>
    router.push({ pathname: "/shop", params: { category: slug ?? "", categoryName: name ?? "" } });

  const heroImage = banners[0]?.image_url;
  const promoBanner = banners[1];

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={brand.burgundy[600]} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" />

      {/* Sticky-ish top block: address + cart + search */}
      <View className="px-5 pt-2 pb-3 bg-background">
        <View className="flex-row items-center justify-between mb-3">
          <Pressable onPress={() => router.push("/addresses")} className="flex-row items-center gap-3 flex-1">
            <View className="w-10 h-10 rounded-full bg-primary-tint items-center justify-center">
              <MapPin size={18} color={brand.burgundy[600]} strokeWidth={2.4} />
            </View>
            <View className="flex-1">
              <Text className="font-body-medium text-[11px] uppercase tracking-widest text-muted-foreground">
                {t("home.deliver_to")}
              </Text>
              <Text
                className="font-display-semibold text-[17px] text-foreground"
                numberOfLines={1}
              >
                {user ? `${user.first_name}, Barcelona` : "Barcelona"}
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => router.push("/cart")}
            className="w-11 h-11 rounded-full bg-card items-center justify-center relative"
            style={shadows.card}
          >
            <ShoppingCart size={20} color={brand.coal[900]} strokeWidth={2.2} />
            {itemCount > 0 && (
              <View
                className="absolute -top-1 -right-1 min-w-[20px] h-5 rounded-full bg-primary items-center justify-center px-1"
                style={shadows.button}
              >
                <Text className="text-primary-foreground text-[10px] font-body-bold">
                  {itemCount}
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Elevated pill search */}
        <Pressable
          onPress={() => router.push("/search")}
          className="flex-row items-center gap-3 h-12 px-4 rounded-full bg-card"
          style={shadows.card}
        >
          <Search size={18} color={brand.textSecondary} strokeWidth={2.2} />
          <Text className="font-body text-[14px] text-muted-foreground">
            {t("home.search_placeholder")}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 128 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={brand.burgundy[600]}
          />
        }
      >
        {/* Hero */}
        <View className="px-5 mb-7">
          <HeroBanner
            eyebrow={t("home.hero_eyebrow")}
            title={t("home.hero_title")}
            subtitle={t("home.hero_subtitle")}
            ctaLabel={t("home.hero_cta")}
            onCtaPress={() => router.push("/deals")}
            imageUrl={heroImage}
          />
        </View>

        {/* Category chips rail */}
        {categories.length > 0 && (
          <View className="mb-7">
            <FlatList
              data={categories}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
              keyExtractor={(c) => c.id}
              renderItem={({ item }) => (
                <CategoryChip
                  name={item.name}
                  imageUrl={item.image_url}
                  onPress={() => openShop(item.slug, item.name)}
                />
              )}
            />
          </View>
        )}

        {/* Featured */}
        {featured.length > 0 && (
          <View className="mb-8">
            <View className="px-5 mb-4">
              <SectionHeader
                eyebrow={t("home.halal_badge")}
                title={t("home.featured")}
                accent="gold"
                actionLabel={t("home.see_all")}
                onActionPress={() => openShop()}
              />
            </View>
            <FlatList
              data={featured}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
              keyExtractor={(p) => p.id}
              renderItem={({ item }) => (
                <ProductCard
                  image={getProductImage(item)}
                  name={item.name}
                  category={item.category_name}
                  price={getMinPrice(item)}
                  rating={item.avg_rating ?? null}
                  isPack={item.unit_type === "pack"}
                  onPress={() => openProduct(item.id)}
                />
              )}
            />
          </View>
        )}

        {/* Category rows */}
        {categories.slice(0, 3).map((cat) => (
          <CategoryProductsSection
            key={cat.id}
            category={cat}
            onOpenProduct={openProduct}
            onSeeAll={() => openShop(cat.slug, cat.name)}
            seeAllLabel={t("home.see_all")}
          />
        ))}

        {/* Mid-scroll promo */}
        {promoBanner && (
          <View className="px-5 mb-8">
            <Pressable
              onPress={() => router.push({ pathname: "/article", params: { id: promoBanner.id } })}
            >
              <HeroBanner
                eyebrow={promoBanner.subtitle}
                title={promoBanner.title}
                imageUrl={promoBanner.image_url}
                height={220}
              />
            </Pressable>
          </View>
        )}

        {/* Packs */}
        {packsCategory && (
          <PacksSection
            onOpenProduct={openProduct}
            onSeeAll={() => openShop(packsCategory.slug, packsCategory.name)}
            category={packsCategory}
            title={t("home.packs")}
            seeAllLabel={t("home.see_all")}
          />
        )}

        {/* Recipes */}
        <RecipesSection
          banners={banners.filter((b) => b.link_type === "recipe")}
          title={t("home.recipes")}
          onPress={(b) => router.push({ pathname: "/article", params: { id: b.id } })}
        />

        {/* Trust footer */}
        <View className="px-5 mt-2">
          <Card className="p-5 flex-row items-center gap-4">
            <HalalBadge label={t("home.halal_badge")} />
            <Text className="flex-1 font-body text-[13px] leading-5 text-muted-foreground">
              {t("home.hero_subtitle")}
            </Text>
            <ChevronRight size={18} color={brand.textSecondary} />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CategoryChip({
  name,
  imageUrl,
  onPress,
}: {
  name: string;
  imageUrl?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="items-center" style={{ width: 76 }}>
      <View
        className="w-16 h-16 rounded-2xl bg-card items-center justify-center mb-2 overflow-hidden"
        style={shadows.card}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <Text className="font-display-semibold text-2xl text-primary">
            {name.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
      <Text
        className="font-body-semibold text-[11px] text-foreground text-center"
        numberOfLines={1}
      >
        {name}
      </Text>
    </Pressable>
  );
}

function CategoryProductsSection({
  category,
  onOpenProduct,
  onSeeAll,
  seeAllLabel,
}: {
  category: Category;
  onOpenProduct: (id: string) => void;
  onSeeAll: () => void;
  seeAllLabel: string;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const { lang } = useLang();

  useEffect(() => {
    (async () => {
      const res = await api.get<Product[]>(
        `/categories/${category.slug}/products?limit=6`,
        false,
      );
      if (res.success && res.data) setProducts(res.data);
    })();
  }, [category.slug, lang]);

  if (products.length === 0) return null;

  return (
    <View className="mb-8">
      <View className="px-5 mb-4">
        <SectionHeader
          title={category.name}
          actionLabel={seeAllLabel}
          onActionPress={onSeeAll}
        />
      </View>
      <FlatList
        data={products}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <ProductCard
            image={getProductImage(item)}
            name={item.name}
            category={item.category_name}
            price={getMinPrice(item)}
            rating={item.avg_rating ?? null}
            onPress={() => onOpenProduct(item.id)}
          />
        )}
      />
    </View>
  );
}

function PacksSection({
  onOpenProduct,
  onSeeAll,
  category,
  title,
  seeAllLabel,
}: {
  onOpenProduct: (id: string) => void;
  onSeeAll: () => void;
  category: Category;
  title: string;
  seeAllLabel: string;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const { lang } = useLang();

  useEffect(() => {
    (async () => {
      const res = await api.get<Product[]>(`/categories/${category.slug}/products?limit=6`, false);
      if (res.success && res.data) setProducts(res.data);
    })();
  }, [category.slug, lang]);

  if (products.length === 0) return null;

  return (
    <View className="mb-8">
      <View className="px-5 mb-4">
        <SectionHeader
          title={title}
          accent="gold"
          actionLabel={seeAllLabel}
          onActionPress={onSeeAll}
        />
      </View>
      <FlatList
        data={products}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <ProductCard
            width={260}
            image={getProductImage(item)}
            name={item.name}
            category={item.category_name}
            price={getMinPrice(item)}
            isPack
            onPress={() => onOpenProduct(item.id)}
          />
        )}
      />
    </View>
  );
}

function RecipesSection({
  banners,
  onPress,
  title,
}: {
  banners: Banner[];
  onPress: (b: Banner) => void;
  title: string;
}) {
  if (banners.length === 0) return null;

  return (
    <View className="mb-8">
      <View className="px-5 mb-4">
        <SectionHeader title={title} eyebrow="Inspiración" />
      </View>
      <FlatList
        data={banners}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
        keyExtractor={(b) => b.id}
        renderItem={({ item }) => (
          <Card
            onPress={() => onPress(item)}
            className="rounded-2xl overflow-hidden"
            style={{ width: 260 }}
          >
            <View className="h-36 w-full bg-coal items-center justify-center">
              {item.image_url ? (
                <Image
                  source={{ uri: item.image_url }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <BookOpen size={36} color={brand.gold[400]} />
              )}
            </View>
            <View className="p-4">
              <Text
                className="font-display-semibold text-[15px] leading-5 text-foreground"
                numberOfLines={2}
              >
                {item.title}
              </Text>
              {item.subtitle && (
                <Text
                  className="font-body text-xs text-muted-foreground mt-1"
                  numberOfLines={1}
                >
                  {item.subtitle}
                </Text>
              )}
            </View>
          </Card>
        )}
      />
    </View>
  );
}

