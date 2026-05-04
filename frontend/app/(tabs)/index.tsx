import { useMemo } from "react";
import { ScrollView, View, RefreshControl, Pressable } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { Motion } from "@legendapp/motion";

import { Display, Heading2, Body, Small } from "@/components/ui/Text";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProductCard } from "@/components/product/ProductCard";
import { useFeatured, useCategories, useOrders, type Product } from "@/hooks/queries";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";

const COL_GAP = 12;

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLang();

  const featured = useFeatured();
  const categories = useCategories();
  const orders = useOrders({ enabled: isAuthenticated });

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t("rebuild.home.greet_morning");
    if (hour < 20) return t("rebuild.home.greet_afternoon");
    return t("rebuild.home.greet_evening");
  }, [t]);

  const refreshing =
    featured.isFetching || categories.isFetching || (isAuthenticated && orders.isFetching);

  const onRefresh = () => {
    featured.refetch();
    categories.refetch();
    if (isAuthenticated) orders.refetch();
  };

  const lastOrder = orders.data?.[0];
  const dealsProducts = useMemo<Product[]>(() => {
    const list = featured.data?.featured ?? [];
    return list.filter((p) =>
      p.variants?.some((v) => v.badge_label || v.compare_at_price),
    );
  }, [featured.data]);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="pb-12"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0B0B0C" />}
      >
        {/* Greeting */}
        <Motion.View
          className="px-5 pt-4 pb-6"
          initial={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 380 }}
        >
          <Small className="text-muted-foreground uppercase tracking-wide">
            {greeting}
          </Small>
          <Display className="mt-1">
            {user?.first_name || t("rebuild.home.greet_guest")}.
          </Display>
        </Motion.View>

        {/* Reorder last */}
        {lastOrder ? (
          <Section
            title={t("rebuild.home.reorder_title")}
            subtitle={t("rebuild.home.reorder_subtitle")}
            onPressMore={() => router.push("/(tabs)/orders")}
            seeMoreLabel={t("common.see_more")}
          >
            <Pressable
              onPress={() => router.push(`/order/${lastOrder.id}` as any)}
              className="mx-5 p-4 rounded-2xl bg-surface border border-border active:opacity-90"
            >
              <Small className="uppercase tracking-wide text-muted-foreground">
                #{lastOrder.order_number}
              </Small>
              <Body className="mt-1 font-body-semibold">
                {(lastOrder.items?.length ?? 0)}{" "}
                {(lastOrder.items?.length ?? 0) === 1 ? "artículo" : "artículos"} ·{" "}
                {new Intl.NumberFormat("es-ES", {
                  style: "currency",
                  currency: "EUR",
                }).format(lastOrder.total)}
              </Body>
            </Pressable>
          </Section>
        ) : null}

        {/* Ofertas hoy */}
        {dealsProducts.length > 0 ? (
          <Section
            title={t("rebuild.home.deals_title")}
            subtitle={t("rebuild.home.deals_subtitle")}
            onPressMore={() => router.push("/(tabs)/categories")}
            seeMoreLabel={t("common.see_more")}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="px-5 gap-3"
            >
              {dealsProducts.slice(0, 8).map((p) => (
                <View key={p.id} style={{ width: 200 }}>
                  <ProductCard
                    product={p as any}
                    onPress={() => router.push(`/product/${p.id}`)}
                  />
                </View>
              ))}
            </ScrollView>
          </Section>
        ) : null}

        {/* Categories */}
        <Section
          title={t("rebuild.home.categories_title")}
          subtitle={t("rebuild.home.categories_subtitle")}
        >
          <View className="px-5">
            {categories.isLoading ? (
              <View className="flex-row flex-wrap" style={{ gap: COL_GAP }}>
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 rounded-2xl" style={{ width: "48%" }} />
                ))}
              </View>
            ) : (
              <View className="flex-row flex-wrap" style={{ gap: COL_GAP }}>
                {(categories.data || []).slice(0, 6).map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => router.push(`/category/${c.slug}` as any)}
                    style={{ width: "48%" }}
                    className="aspect-[3/2] rounded-2xl overflow-hidden bg-muted active:opacity-90"
                  >
                    {c.image_url ? (
                      <Image
                        source={{ uri: c.image_url }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                        transition={200}
                      />
                    ) : null}
                    <View className="absolute inset-0 bg-foreground/30" />
                    <View className="absolute inset-0 p-3 justify-end">
                      <Heading2 className="text-background">{c.name}</Heading2>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </Section>

        {/* Bestsellers */}
        <Section
          title={t("rebuild.home.bestsellers_title")}
          subtitle={t("rebuild.home.bestsellers_subtitle")}
        >
          {featured.isLoading ? (
            <View className="px-5 flex-row gap-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-72 rounded-2xl flex-1" />
              ))}
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="px-5 gap-3"
            >
              {(featured.data?.bestsellers ?? []).slice(0, 10).map((p) => (
                <View key={p.id} style={{ width: 200 }}>
                  <ProductCard
                    product={p as any}
                    onPress={() => router.push(`/product/${p.id}`)}
                  />
                </View>
              ))}
            </ScrollView>
          )}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

interface SectionProps {
  title: string;
  subtitle?: string;
  onPressMore?: () => void;
  seeMoreLabel?: string;
  children: React.ReactNode;
}

function Section({ title, subtitle, onPressMore, seeMoreLabel, children }: SectionProps) {
  return (
    <View className="mt-6">
      <View className="px-5 mb-3 flex-row items-end justify-between">
        <View className="flex-1 pr-2">
          <Heading2>{title}</Heading2>
          {subtitle ? (
            <Small className="mt-0.5 text-muted-foreground">{subtitle}</Small>
          ) : null}
        </View>
        {onPressMore ? (
          <Pressable onPress={onPressMore} className="flex-row items-center active:opacity-60">
            <Small className="text-foreground font-body-semibold">{seeMoreLabel || "Ver más"}</Small>
            <ChevronRight size={16} color="#0B0B0C" strokeWidth={2} />
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

