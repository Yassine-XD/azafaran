import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Package, Clock, Truck, CheckCircle, RotateCcw, XCircle } from "lucide-react-native";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useRouter } from "expo-router";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Order, OrderStatus } from "@/lib/types";

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bgColor: string; icon: any }> = {
  pending: { label: "Pendiente", color: "text-yellow-600", bgColor: "bg-yellow-100", icon: Clock },
  confirmed: { label: "Confirmado", color: "text-blue-600", bgColor: "bg-blue-100", icon: Package },
  preparing: { label: "Preparando", color: "text-orange-600", bgColor: "bg-orange-100", icon: Package },
  shipped: { label: "En camino", color: "text-purple-600", bgColor: "bg-purple-100", icon: Truck },
  delivered: { label: "Entregado", color: "text-green-600", bgColor: "bg-green-100", icon: CheckCircle },
  cancelled: { label: "Cancelado", color: "text-red-600", bgColor: "bg-red-100", icon: XCircle },
};

export default function OrdersScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated) { setIsLoading(false); return; }
    const res = await api.get<Order[]>("/orders/");
    if (res.success && res.data) setOrders(res.data);
    setIsLoading(false);
  }, [isAuthenticated]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, [fetchOrders]);

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
        <Package size={64} className="text-muted-foreground mb-4" />
        <Text className="text-xl font-bold text-foreground mb-2">Inicia sesión</Text>
        <Text className="text-muted-foreground text-center mb-6">Inicia sesión para ver tus pedidos</Text>
        <TouchableOpacity onPress={() => router.push("/login")} className="bg-primary px-8 py-3 rounded-xl">
          <Text className="text-primary-foreground font-bold">Iniciar Sesión</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#ea580c" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "left", "right"]}>
      <View className="px-6 py-4 border-b border-border flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-foreground">Mis Pedidos</Text>
        <ThemeToggle />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 128, padding: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ea580c" />}
      >
        {orders.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Package size={48} className="text-muted-foreground mb-4" />
            <Text className="text-lg font-semibold text-foreground mb-1">Sin pedidos</Text>
            <Text className="text-muted-foreground text-center">Aún no has realizado ningún pedido</Text>
          </View>
        ) : (
          orders.map((order) => {
            const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const StatusIcon = config.icon;
            return (
              <TouchableOpacity
                key={order.id}
                onPress={() => router.push({ pathname: "/order-details", params: { id: order.id } })}
                className="bg-card rounded-2xl border border-border p-4 mb-3"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-foreground font-semibold">#{order.id.slice(0, 8)}</Text>
                  <View className={`flex-row items-center gap-1.5 px-3 py-1 rounded-full ${config.bgColor}`}>
                    <StatusIcon size={14} className={config.color} />
                    <Text className={`text-xs font-semibold ${config.color}`}>{config.label}</Text>
                  </View>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-muted-foreground text-sm">
                    {new Date(order.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                  </Text>
                  <Text className="text-foreground font-bold text-lg">€{Number(order.total).toFixed(2)}</Text>
                </View>
                {order.items && order.items.length > 0 && (
                  <Text className="text-muted-foreground text-xs mt-2">
                    {order.items.length} {order.items.length === 1 ? "producto" : "productos"}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
