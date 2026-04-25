import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Package, Clock, Truck, CheckCircle, XCircle } from "lucide-react-native";
import { useRouter } from "expo-router";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import type { Order, OrderStatus } from "@/lib/types";
import { Button, Chip, PriceTag } from "@/components/ui";
import { brand, shadows } from "@/theme";

type StatusStyle = {
  label: string;
  accentHex: string;
  pillClass: string;
  iconColor: string;
  icon: typeof Package;
};

export default function OrdersScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { t } = useLang();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState("");

  const STATUS: Record<OrderStatus, StatusStyle> = {
    pending: {
      label: t("orders.status_pending"),
      accentHex: "#CA8A04",
      pillClass: "bg-[#FEF3C7]",
      iconColor: "#92400E",
      icon: Clock,
    },
    confirmed: {
      label: t("orders.status_confirmed"),
      accentHex: "#2563EB",
      pillClass: "bg-[#DBEAFE]",
      iconColor: "#1E40AF",
      icon: Package,
    },
    preparing: {
      label: t("orders.status_preparing"),
      accentHex: "#EA580C",
      pillClass: "bg-[#FFEDD5]",
      iconColor: "#9A3412",
      icon: Package,
    },
    shipped: {
      label: t("orders.status_shipped"),
      accentHex: "#7C3AED",
      pillClass: "bg-[#EDE9FE]",
      iconColor: "#5B21B6",
      icon: Truck,
    },
    delivered: {
      label: t("orders.status_delivered"),
      accentHex: "#16A34A",
      pillClass: "bg-[#DCFCE7]",
      iconColor: "#166534",
      icon: CheckCircle,
    },
    cancelled: {
      label: t("orders.status_cancelled"),
      accentHex: "#DC2626",
      pillClass: "bg-[#FEE2E2]",
      iconColor: "#991B1B",
      icon: XCircle,
    },
  };

  const PERIOD_FILTERS = [
    { key: "", label: t("orders.filter_all") },
    { key: "3d", label: t("orders.filter_3d") },
    { key: "7d", label: t("orders.filter_week") },
    { key: "30d", label: t("orders.filter_month") },
  ];

  const fetchOrders = useCallback(
    async (p?: string) => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }
      const query = p ? `?period=${p}` : "";
      const res = await api.get<Order[]>(`/orders/${query}`);
      if (res.success && res.data) setOrders(res.data);
      setIsLoading(false);
    },
    [isAuthenticated],
  );

  useEffect(() => {
    fetchOrders(period);
  }, [fetchOrders, period]);

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
        <View className="w-20 h-20 rounded-full bg-primary-tint items-center justify-center mb-6">
          <Package size={32} color={brand.burgundy[600]} />
        </View>
        <Text className="font-display text-[22px] text-foreground mb-2">
          {t("orders.login_title")}
        </Text>
        <Text className="font-body text-muted-foreground text-center mb-8 leading-6">
          {t("orders.login_subtitle")}
        </Text>
        <Button
          label={t("orders.login_button")}
          onPress={() => router.push("/login")}
          fullWidth={false}
        />
      </SafeAreaView>
    );
  }

  if (isLoading && orders.length === 0) {
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
          {t("orders.title")}
        </Text>
      </View>

      <View className="pb-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        >
          {PERIOD_FILTERS.map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              active={period === f.key}
              onPress={() => handlePeriodChange(f.key)}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 128, paddingHorizontal: 20, gap: 14 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={brand.burgundy[600]} />
        }
      >
        {orders.length === 0 ? (
          <View className="items-center justify-center py-20">
            <View className="w-16 h-16 rounded-full bg-muted items-center justify-center mb-4">
              <Package size={28} color={brand.textSecondary} />
            </View>
            <Text className="font-display text-[20px] text-foreground mb-1">
              {t("orders.empty_title")}
            </Text>
            <Text className="font-body text-muted-foreground text-center">
              {period ? t("orders.empty_subtitle_period") : t("orders.empty_subtitle")}
            </Text>
          </View>
        ) : (
          orders.map((order) => {
            const style = STATUS[order.status] || STATUS.pending;
            const StatusIcon = style.icon;
            const orderItems = order.items || [];
            return (
              <Pressable
                key={order.id}
                onPress={() => router.push({ pathname: "/order-details", params: { id: order.id } })}
                className="bg-card rounded-2xl overflow-hidden flex-row"
                style={shadows.card}
              >
                {/* Status accent bar */}
                <View style={{ width: 5, backgroundColor: style.accentHex }} />

                <View className="flex-1 p-4">
                  <View className="flex-row items-center justify-between mb-3">
                    <View>
                      <Text className="font-body-semibold text-[11px] uppercase tracking-widest text-muted-foreground mb-0.5">
                        #{order.id.slice(0, 8)}
                      </Text>
                      <Text className="font-body-medium text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </Text>
                    </View>
                    <View className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full ${style.pillClass}`}>
                      <StatusIcon size={13} color={style.iconColor} strokeWidth={2.4} />
                      <Text
                        className="font-body-bold text-[11px] uppercase tracking-wider"
                        style={{ color: style.iconColor }}
                      >
                        {style.label}
                      </Text>
                    </View>
                  </View>

                  {orderItems.length > 0 && (
                    <View className="mb-3 gap-1.5">
                      {orderItems.slice(0, 3).map((item, idx) => {
                        const snapshot = item.product_snapshot as
                          | { name?: string; images?: { url: string }[] }
                          | undefined;
                        const name = item.product_name || snapshot?.name || "Producto";
                        const image = snapshot?.images?.[0]?.url;
                        return (
                          <View key={idx} className="flex-row items-center gap-2.5">
                            {image ? (
                              <Image
                                source={{ uri: image }}
                                className="w-9 h-9 rounded-lg"
                                resizeMode="cover"
                              />
                            ) : (
                              <View className="w-9 h-9 rounded-lg bg-muted items-center justify-center">
                                <Package size={14} color={brand.textSecondary} />
                              </View>
                            )}
                            <Text className="flex-1 font-body-medium text-[13px] text-foreground" numberOfLines={1}>
                              {name}
                            </Text>
                            <Text className="font-body-semibold text-xs text-muted-foreground">
                              ×{item.quantity}
                            </Text>
                          </View>
                        );
                      })}
                      {orderItems.length > 3 && (
                        <Text className="font-body text-xs text-muted-foreground pl-11">
                          +{orderItems.length - 3} {t("orders.more")}
                        </Text>
                      )}
                    </View>
                  )}

                  <View className="flex-row items-center justify-between border-t border-border pt-3">
                    <Text className="font-body text-xs text-muted-foreground">
                      {orderItems.length} {t("home.items")}
                    </Text>
                    <PriceTag amount={order.total} size="md" />
                  </View>
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
