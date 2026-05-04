import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { api } from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import type { Category, Product, Banner, Promotion } from "@/lib/types";
import { getProductImage, getMinPrice } from "@/lib/types";
import {
  SectionHeader,
  ProductCard,
  MobileTopBar,
  TrustStrip,
  HeroBannerCarousel,
  CategoryRail,
  PromoRow,
  FlashDealCard,
} from "@/components/ui";
import { brand } from "@/theme";

export default function HomeScreen() {
  const router = useRouter();
  const { t, lang } = useLang();
  const { addItem } = useCart();

  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    const [catRes, featRes, prodRes, bannerRes, promoRes] = await Promise.all([
      api.get<Category[]>("/categories/", false),
      api.get<Product[]>("/products/featured", false),
      api.get<Product[]>("/products/", false),
      api.get<Banner[]>("/promotions/banners", false),
      api.get<Promotion[]>("/promotions/active", false),
    ]);
    if (catRes.success && catRes.data) setCategories(catRes.data);
    if (featRes.success && featRes.data) setFeatured(featRes.data);
    if (prodRes.success && prodRes.data) setProducts(prodRes.data);
    if (bannerRes.success && bannerRes.data) setBanners(bannerRes.data);
    if (promoRes.success && promoRes.data) setPromotions(promoRes.data);
    setIsLoading(false);
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

  const openProduct = (p: Product) =>
    router.push({ pathname: "/product-detail", params: { id: p.id } });

  const openShop = (slug?: string, name?: string) =>
    router.push({
      pathname: "/shop",
      params: { category: slug ?? "", categoryName: name ?? "" },
    });

  const quickAdd = async (p: Product) => {
    const variant = p.variants?.[0];
    if (!variant) {
      router.push({ pathname: "/product-detail", params: { id: p.id } });
      return;
    }
    await addItem(variant.id, 1, {
      product_name: p.name,
      product_image: getProductImage(p),
      weight_label: variant.label,
      price: variant.price,
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={brand.burgundy[600]} />
      </SafeAreaView>
    );
  }

  const bestSellers = products.slice(0, 6);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" />
      <MobileTopBar />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={brand.burgundy[600]}
          />
        }
      >
        {/* Greeting */}
        <View className="px-5 pt-2 pb-5">
          <Text className="font-body text-sm text-muted-foreground">
            {t("home.greeting")} 👋
          </Text>
          <Text className="font-display text-3xl leading-9 text-foreground mt-1">
            {t("home.greeting_title")}{" "}
            <Text className="text-primary">{t("home.greeting_title_accent")}</Text>
          </Text>
        </View>

        {/* Hero banners carousel */}
        {banners.length > 0 && (
          <View className="mb-6">
            <HeroBannerCarousel
              banners={banners}
              onBannerPress={() => router.push("/deals")}
            />
          </View>
        )}

        {/* Trust strip */}
        <View className="mb-7">
          <TrustStrip />
        </View>

        {/* Categories rail */}
        {categories.length > 0 && (
          <View className="mb-7">
            <View className="px-5 mb-3">
              <SectionHeader
                title={t("home.categories_title")}
                actionLabel={t("home.see_all")}
                onActionPress={() => router.push("/categories")}
              />
            </View>
            <CategoryRail
              categories={categories}
              onPress={(c) => openShop(c.slug, c.name)}
            />
          </View>
        )}

        {/* Featured products carousel */}
        {featured.length > 0 && (
          <View className="mb-7">
            <View className="px-5 mb-3">
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
                  compareAt={item.variants?.[0]?.compare_at_price}
                  rating={item.avg_rating}
                  isPack={item.tags?.includes("pack")}
                  isDeal={Boolean(item.variants?.[0]?.compare_at_price)}
                  onPress={() => openProduct(item)}
                  onAdd={() => quickAdd(item)}
                  width={220}
                />
              )}
            />
          </View>
        )}

        {/* Flash deal CTA */}
        <View className="px-5 mb-7">
          <FlashDealCard
            eyebrow={t("home.flash_deal_eyebrow")}
            title={t("home.flash_deal_title")}
            onPress={() => router.push("/deals")}
          />
        </View>

        {/* Promos & coupons */}
        {promotions.length > 0 && (
          <View className="px-5 mb-7">
            <SectionHeader title={t("home.promos_title")} className="mb-3" />
            <View className="gap-2">
              {promotions.slice(0, 3).map((p) => (
                <PromoRow
                  key={p.id}
                  promo={p}
                  onPress={() => router.push("/deals")}
                />
              ))}
            </View>
          </View>
        )}

        {/* Best sellers grid */}
        {bestSellers.length > 0 && (
          <View className="px-5 mb-7">
            <SectionHeader
              title={t("home.best_sellers")}
              actionLabel={t("home.see_all")}
              onActionPress={() => openShop()}
              className="mb-3"
            />
            <View className="flex-row flex-wrap" style={{ gap: 12 }}>
              {bestSellers.map((p) => (
                <View
                  key={p.id}
                  style={{ width: "48%" }}
                >
                  <ProductCard
                    image={getProductImage(p)}
                    name={p.name}
                    category={p.category_name}
                    price={getMinPrice(p)}
                    compareAt={p.variants?.[0]?.compare_at_price}
                    rating={p.avg_rating}
                    onPress={() => openProduct(p)}
                    onAdd={() => quickAdd(p)}
                    width="full"
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
