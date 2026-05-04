import React, { useEffect, useState, useCallback, useMemo } from "react";
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
import {
  Package,
  ChevronRight,
  RotateCw,
  Truck,
  Eye,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import type { Order, OrderStatus } from "@/lib/types";
import { Button, Gradient } from "@/components/ui";
import { brand, shadows } from "@/theme";

type Filter = "all" | "active" | "delivered" | "cancelled";

const STATUS_PILL: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  pending: { label: "Pendiente", bg: "bg-gold/20", text: "text-gold-deep" },
  confirmed: { label: "Confirmado", bg: "bg-primary/15", text: "text-primary" },
  preparing: { label: "Preparando", bg: "bg-gold/20", text: "text-gold-deep" },
  shipped: { label: "En camino", bg: "bg-primary/15", text: "text-primary" },
  delivered: { label: "Entregado", bg: "bg-muted", text: "text-foreground" },
  cancelled: { label: "Cancelado", bg: "bg-muted", text: "text-muted-foreground" },
};

export default function OrdersScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { t } = useLang();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    const res = await api.get<Order[]>("/orders/");
    if (res.success && res.data) setOrders(res.data);
    setIsLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, [fetchOrders]);

  const visible = useMemo(() => {
    if (filter === "all") return orders;
    if (filter === "active") {
      return orders.filter((o) =>
        ["pending", "confirmed", "preparing", "shipped"].includes(o.status),
      );
    }
    if (filter === "delivered") return orders.filter((o) => o.status === "delivered");
    return orders.filter((o) => o.status === "cancelled");
  }, [orders, filter]);

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
        <Text className="font-body text-sm text-muted-foreground">
          {t("orders.eyebrow")}
        </Text>
        <Text className="font-display text-3xl leading-9 text-foreground mt-0.5">
          {t("orders.title")}
        </Text>
      </View>

      {/* Filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        className="mb-3 grow-0"
      >
        <FilterPill label={t("orders.filter_all")} active={filter === "all"} onPress={() => setFilter("all")} />
        <FilterPill label={t("orders.filter_active")} active={filter === "active"} onPress={() => setFilter("active")} />
        <FilterPill label={t("orders.status_delivered")} active={filter === "delivered"} onPress={() => setFilter("delivered")} />
        <FilterPill label={t("orders.status_cancelled")} active={filter === "cancelled"} onPress={() => setFilter("cancelled")} />
      </ScrollView>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 20, gap: 12 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={brand.burgundy[600]}
          />
        }
      >
        {visible.length === 0 ? (
          <View className="items-center justify-center py-20">
            <View className="w-16 h-16 rounded-full bg-muted items-center justify-center mb-3">
              <Package size={28} color={brand.textSecondary} />
            </View>
            <Text className="font-display text-xl text-foreground">
              {t("orders.empty_title")}
            </Text>
            <Text className="font-body text-muted-foreground text-center mt-1">
              {t("orders.empty_subtitle")}
            </Text>
          </View>
        ) : (
          visible.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              t={t}
              onOpen={() =>
                router.push({ pathname: "/order-details", params: { id: order.id } })
              }
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function FilterPill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  if (active) {
    return (
      <Pressable onPress={onPress} className="rounded-full overflow-hidden" style={shadows.button}>
        <Gradient
          name="primary"
          style={{ height: 36, paddingHorizontal: 16, justifyContent: "center" }}
        >
          <Text className="font-body-bold text-xs text-white">{label}</Text>
        </Gradient>
      </Pressable>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      className="h-9 px-4 rounded-full bg-card border border-border justify-center"
    >
      <Text className="font-body-bold text-xs text-foreground">{label}</Text>
    </Pressable>
  );
}

function OrderCard({
  order,
  t,
  onOpen,
}: {
  order: Order;
  t: (k: string) => string;
  onOpen: () => void;
}) {
  const pill = STATUS_PILL[order.status] ?? STATUS_PILL.pending;
  const items = order.items ?? [];
  const isShipped = order.status === "shipped" || order.status === "preparing";
  const date = new Date(order.created_at).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Pressable
      onPress={onOpen}
      className="bg-card rounded-3xl border border-border p-4"
      style={shadows.card}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View>
          <Text className="font-body text-xs text-muted-foreground">
            #{order.id.slice(0, 8)}
          </Text>
          <Text className="font-body-bold text-sm text-foreground mt-0.5">{date}</Text>
        </View>
        <View className={`px-2.5 py-1 rounded-full ${pill.bg}`}>
          <Text className={`text-[10px] font-body-bold uppercase ${pill.text}`}>
            {t(`orders.status_${order.status}`)}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2 mb-3">
        <View className="flex-row" style={{ marginLeft: 4 }}>
          {items.slice(0, 3).map((it, i) => {
            const snap = it.product_snapshot as
              | { images?: { url: string }[] }
              | undefined;
            const img = it.product_image ?? snap?.images?.[0]?.url;
            return (
              <View
                key={i}
                style={{
                  marginLeft: i === 0 ? 0 : -10,
                  borderWidth: 2,
                  borderColor: "#FFFFFF",
                  borderRadius: 999,
                }}
              >
                {img ? (
                  <Image
                    source={{ uri: img }}
                    style={{ width: 36, height: 36, borderRadius: 999 }}
                  />
                ) : (
                  <View
                    className="bg-muted items-center justify-center"
                    style={{ width: 36, height: 36, borderRadius: 999 }}
                  >
                    <Package size={14} color={brand.textSecondary} />
                  </View>
                )}
              </View>
            );
          })}
        </View>
        <Text className="flex-1 font-body text-xs text-muted-foreground">
          {items.length} {t("home.items")} · €{Number(order.total).toFixed(2)}
        </Text>
        <ChevronRight size={16} color={brand.textSecondary} />
      </View>

      <View className="flex-row gap-2">
        <View className="flex-1 h-9 rounded-xl bg-primary/10 items-center justify-center flex-row gap-1.5">
          <RotateCw size={13} color={brand.burgundy[600]} strokeWidth={2.4} />
          <Text className="font-body-bold text-xs text-primary">
            {t("orders.reorder")}
          </Text>
        </View>
        {isShipped ? (
          <View className="flex-1 rounded-xl overflow-hidden" style={shadows.button}>
            <Gradient
              name="primary"
              style={{
                height: 36,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <Truck size={13} color="#FFFFFF" strokeWidth={2.4} />
              <Text className="font-body-bold text-xs text-white">
                {t("orders.track")}
              </Text>
            </Gradient>
          </View>
        ) : (
          <View className="flex-1 h-9 rounded-xl bg-muted items-center justify-center flex-row gap-1.5">
            <Eye size={13} color={brand.coal[900]} strokeWidth={2.4} />
            <Text className="font-body-bold text-xs text-foreground">
              {t("orders.details")}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
