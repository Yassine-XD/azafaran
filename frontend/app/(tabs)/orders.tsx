import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Package, Clock, Truck, CheckCircle, XCircle } from "lucide-react-native";
import { useRouter } from "expo-router";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import type { Order, OrderStatus } from "@/lib/types";

export default function OrdersScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { t } = useLang();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState("");

  const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bgColor: string; icon: any }> = {
    pending: { label: t("orders.status_pending"), color: "text-yellow-600", bgColor: "bg-yellow-100", icon: Clock },
    confirmed: { label: t("orders.status_confirmed"), color: "text-blue-600", bgColor: "bg-blue-100", icon: Package },
    preparing: { label: t("orders.status_preparing"), color: "text-orange-600", bgColor: "bg-orange-100", icon: Package },
    shipped: { label: t("orders.status_shipped"), color: "text-purple-600", bgColor: "bg-purple-100", icon: Truck },
    delivered: { label: t("orders.status_delivered"), color: "text-green-600", bgColor: "bg-green-100", icon: CheckCircle },
    cancelled: { label: t("orders.status_cancelled"), color: "text-red-600", bgColor: "bg-red-100", icon: XCircle },
  };

  const PERIOD_FILTERS = [
    { key: "", label: t("orders.filter_all") },
    { key: "3d", label: t("orders.filter_3d") },
    { key: "7d", label: t("orders.filter_week") },
    { key: "30d", label: t("orders.filter_month") },
  ];

  const fetchOrders = useCallback(async (p?: string) => {
    if (!isAuthenticated) { setIsLoading(false); return; }
    const query = p ? `?period=${p}` : "";
    const res = await api.get<Order[]>(`/orders/${query}`);
    if (res.success && res.data) setOrders(res.data);
    setIsLoading(false);
  }, [isAuthenticated]);

  useEffect(() => { fetchOrders(period); }, [fetchOrders, period]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders(period);
    setRefreshing(false);
  }, [fetchOrders, period]);

  const handlePeriodChange = (p: string) => {
    setOrders([]);
    setPeriod(p);
    setIsLoading(true);
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
        <Package size={64} className="text-muted-foreground mb-4" />
        <Text className="text-xl font-bold text-foreground mb-2">{t("orders.login_title")}</Text>
        <Text className="text-muted-foreground text-center mb-6">{t("orders.login_subtitle")}</Text>
        <TouchableOpacity onPress={() => router.push("/login")} className="bg-primary px-8 py-3 rounded-xl">
          <Text className="text-primary-foreground font-bold">{t("orders.login_button")}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (isLoading && orders.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#ea580c" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "left", "right"]}>
      <View className="px-6 py-4 border-b border-border">
        <Text className="text-2xl font-bold text-foreground">{t("orders.title")}</Text>
      </View>

      {/* Period Filter Chips */}
      <View className="px-4 py-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {PERIOD_FILTERS.map((f) => {
            const isActive = period === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                onPress={() => handlePeriodChange(f.key)}
                className={`mr-2 px-4 py-2 rounded-full border ${
                  isActive ? "border-primary bg-primary" : "border-border bg-card"
                }`}
              >
                <Text className={`text-sm font-medium ${isActive ? "text-primary-foreground" : "text-foreground"}`}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 128, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ea580c" />}
      >
        {orders.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Package size={48} className="text-muted-foreground mb-4" />
            <Text className="text-lg font-semibold text-foreground mb-1">{t("orders.empty_title")}</Text>
            <Text className="text-muted-foreground text-center">
              {period ? t("orders.empty_subtitle_period") : t("orders.empty_subtitle")}
            </Text>
          </View>
        ) : (
          orders.map((order) => {
            const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const StatusIcon = config.icon;
            const orderItems = order.items || [];
            return (
              <TouchableOpacity
                key={order.id}
                onPress={() => router.push({ pathname: "/order-details", params: { id: order.id } })}
                className="bg-card rounded-2xl border border-border p-4 mb-3"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-foreground font-semibold">#{order.id.slice(0, 8)}</Text>
                  <View className={`flex-row items-center gap-1.5 px-3 py-1 rounded-full ${config.bgColor}`}>
                    <StatusIcon size={14} className={config.color} />
                    <Text className={`text-xs font-semibold ${config.color}`}>{config.label}</Text>
                  </View>
                </View>

                {orderItems.length > 0 && (
                  <View className="mb-3">
                    {orderItems.slice(0, 3).map((item, idx) => {
                      const snapshot = item.product_snapshot as any;
                      const name = item.product_name || snapshot?.name || "Producto";
                      const image = snapshot?.images?.[0]?.url;
                      return (
                        <View key={idx} className="flex-row items-center gap-2 mb-1.5">
                          {image ? (
                            <Image source={{ uri: image }} className="w-8 h-8" resizeMode="cover" />
                          ) : (
                            <View className="w-8 h-8 rounded-md bg-muted items-center justify-center">
                              <Package size={14} className="text-muted-foreground" />
                            </View>
                          )}
                          <Text className="text-foreground text-sm flex-1" numberOfLines={1}>{name}</Text>
                          <Text className="text-muted-foreground text-xs">x{item.quantity}</Text>
                        </View>
                      );
                    })}
                    {orderItems.length > 3 && (
                      <Text className="text-muted-foreground text-xs ml-10">
                        +{orderItems.length - 3} {t("orders.more")}
                      </Text>
                    )}
                  </View>
                )}

                <View className="flex-row items-center justify-between border-t border-border pt-2">
                  <Text className="text-muted-foreground text-sm">
                    {new Date(order.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                  </Text>
                  <Text className="text-foreground font-bold text-lg">€{Number(order.total).toFixed(2)}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
