import { useMemo } from "react";
import { ScrollView, View, RefreshControl, Pressable } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";

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
    if (hour < 12) return "Buenos días";
    if (hour < 20) return "Buenas tardes";
    return "Buenas noches";
  }, []);

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
        <View className="px-5 pt-4 pb-6">
          <Small className="text-muted-foreground uppercase tracking-wide">
            {greeting}
          </Small>
          <Display className="mt-1">
            {user?.first_name || t("home.greeting_guest") || "Hola"}.
          </Display>
        </View>

        {/* Reorder last */}
        {lastOrder ? (
          <Section
            title={t("home.reorder_title") || "Repetir pedido"}
            subtitle={t("home.reorder_subtitle") || "Lo de la semana pasada, en un toque"}
            onPressMore={() => router.push("/(tabs)/orders")}
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
            title={t("home.deals_title") || "Ofertas hoy"}
            subtitle={t("home.deals_subtitle") || "Carne fresca a precio especial"}
            onPressMore={() => router.push("/(tabs)/categories")}
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
          title={t("home.categories_title") || "Categorías"}
          subtitle={t("home.categories_subtitle") || "Cordero, ternera, pollo y más"}
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
          title={t("home.bestsellers_title") || "Lo más pedido"}
          subtitle={t("home.bestsellers_subtitle") || "Lo que más compran nuestras familias"}
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
  children: React.ReactNode;
}

function Section({ title, subtitle, onPressMore, children }: SectionProps) {
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
            <Small className="text-foreground font-body-semibold">Ver más</Small>
            <ChevronRight size={16} color="#0B0B0C" strokeWidth={2} />
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

