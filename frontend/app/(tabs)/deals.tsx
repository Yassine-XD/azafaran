import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Clock, Tag, ArrowRight } from "lucide-react-native";
import { api } from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";
import type { Promotion } from "@/lib/types";
import { SectionHeader } from "@/components/ui";
import { brand, shadows } from "@/theme";

export default function DealsScreen() {
  const { t } = useLang();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDeals = useCallback(async () => {
    const res = await api.get<Promotion[]>("/promotions/active", false);
    if (res.success && res.data) setPromotions(res.data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDeals();
    setRefreshing(false);
  }, [fetchDeals]);

  const getRemainingTime = (endDate: string) => {
    const diff = new Date(endDate).getTime() - Date.now();
    if (diff <= 0) return "—";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

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

      <View className="px-5 pt-2 pb-4">
        <Text className="font-body-semibold text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
          Azafarán
        </Text>
        <Text className="font-display text-[30px] leading-9 text-foreground">
          {t("tabs.deals")}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 128 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={brand.burgundy[600]} />
        }
      >
        {promotions.length === 0 ? (
          <View className="items-center justify-center py-24">
            <View className="w-16 h-16 rounded-full bg-primary-tint items-center justify-center mb-4">
              <Tag size={26} color={brand.burgundy[600]} />
            </View>
            <Text className="font-display text-[20px] text-foreground mb-1">
              Sin ofertas activas
            </Text>
            <Text className="font-body text-muted-foreground text-center">
              Vuelve pronto para nuevas promociones
            </Text>
          </View>
        ) : (
          <>
            <SectionHeader
              title="Ofertas activas"
              eyebrow="Por tiempo limitado"
              accent="gold"
              className="mb-4"
            />
            <View className="gap-4">
              {promotions.map((promo) => (
                <PromoCard
                  key={promo.id}
                  promo={promo}
                  remaining={getRemainingTime(
                    (promo as { ends_at?: string; end_date?: string }).ends_at ??
                      promo.end_date ??
                      "",
                  )}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function PromoCard({
  promo,
  remaining,
}: {
  promo: Promotion & { subtitle?: string };
  remaining: string;
}) {
  const description = promo.description || promo.subtitle;
  return (
    <Pressable style={shadows.cardLift} className="rounded-3xl overflow-hidden bg-coal">
      <ImageBackground
        source={{ uri: promo.image_url || undefined }}
        style={{ height: 200 }}
        imageStyle={{ backgroundColor: "#1A0F0F" }}
      >
        <LinearGradient
          colors={["rgba(26,15,15,0.05)", "rgba(26,15,15,0.4)", "rgba(26,15,15,0.92)"]}
          locations={[0, 0.5, 1]}
          style={{ flex: 1, padding: 20, justifyContent: "space-between" }}
        >
          <View className="flex-row items-start justify-between">
            {promo.discount_pct ? (
              <View className="bg-gold px-3 py-1.5 rounded-full" style={shadows.goldGlow}>
                <Text className="font-body-bold text-coal text-xs tracking-wider">
                  −{promo.discount_pct}%
                </Text>
              </View>
            ) : (
              <View />
            )}
            <View className="flex-row items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
              <Clock size={12} color="#C9A961" strokeWidth={2.4} />
              <Text className="font-body-semibold text-[11px] text-gold">{remaining}</Text>
            </View>
          </View>

          <View>
            <Text className="font-display text-white text-[22px] leading-7 mb-1.5" numberOfLines={2}>
              {promo.title}
            </Text>
            {description && (
              <Text className="font-body text-white/75 text-sm mb-3" numberOfLines={2}>
                {description}
              </Text>
            )}

            <View className="flex-row items-center justify-between">
              {promo.min_order_amount ? (
                <Text className="font-body text-white/65 text-xs">
                  Mínimo €{Number(promo.min_order_amount).toFixed(0)}
                </Text>
              ) : (
                <View />
              )}
              <View className="flex-row items-center gap-1">
                <Text className="font-body-semibold text-gold text-sm">Ver detalle</Text>
                <ArrowRight size={14} color="#C9A961" strokeWidth={2.4} />
              </View>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </Pressable>
  );
}
