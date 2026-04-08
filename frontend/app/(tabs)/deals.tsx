import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Clock, Tag, Plus } from "lucide-react-native";
import { api } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import type { Promotion } from "@/lib/types";

export default function DealsScreen() {
  const router = useRouter();
  const { addItem } = useCart();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDeals = useCallback(async () => {
    const res = await api.get<Promotion[]>("/promotions/active", false);
    if (res.success && res.data) setPromotions(res.data);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchDeals(); }, [fetchDeals]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDeals();
    setRefreshing(false);
  }, [fetchDeals]);

  const getRemainingTime = (endDate: string) => {
    const diff = new Date(endDate).getTime() - Date.now();
    if (diff <= 0) return "Expirado";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#ea580c" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "left", "right"]}>
      <View className="px-6 py-4 border-b border-border">
        <Text className="text-2xl font-bold text-foreground">Ofertas</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 128 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ea580c" />}
      >
        {promotions.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Tag size={48} className="text-muted-foreground mb-4" />
            <Text className="text-lg font-semibold text-foreground mb-1">Sin ofertas activas</Text>
            <Text className="text-muted-foreground text-center">Vuelve pronto para nuevas promociones</Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap">
            {promotions.map((promo) => (
              <View key={promo.id} className="w-full p-2">
                <View className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border">
                  {promo.image_url && (
                    <View className="relative">
                      <Image source={{ uri: promo.image_url }} className="w-full h-32" resizeMode="cover" />
                      {promo.discount_pct && (
                        <View className="absolute top-2 left-2 bg-destructive px-2 py-1 rounded-md">
                          <Text className="text-white text-xs font-bold">-{promo.discount_pct}%</Text>
                        </View>
                      )}
                    </View>
                  )}
                  <View className="p-3">
                    <Text className="text-foreground font-semibold text-sm mb-1" numberOfLines={2}>
                      {promo.title}
                    </Text>
                    {promo.subtitle && (
                      <Text className="text-muted-foreground text-xs mb-2" numberOfLines={2}>
                        {promo.subtitle}
                      </Text>
                    )}
                    <View className="flex-row items-center">
                      <Clock size={12} className="text-muted-foreground mr-1" />
                      <Text className="text-muted-foreground text-xs px-2">
                        {getRemainingTime(promo.ends_at)}
                      </Text>
                    </View>
                    {promo.min_order_amount && (
                      <Text className="text-xs text-muted-foreground mt-1">
                        Pedido mín. €{Number(promo.min_order_amount).toFixed(0)}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
