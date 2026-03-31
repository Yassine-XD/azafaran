import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, CheckCircle, Clock, Truck, Package, RotateCcw, MapPin, XCircle } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { api } from "@/lib/api";
import type { Order, OrderStatus } from "@/lib/types";

const TIMELINE_STEPS: { status: OrderStatus; label: string; icon: any }[] = [
  { status: "pending", label: "Pedido Realizado", icon: Clock },
  { status: "confirmed", label: "Confirmado", icon: Package },
  { status: "preparing", label: "Preparando", icon: Package },
  { status: "shipped", label: "En Camino", icon: Truck },
  { status: "delivered", label: "Entregado", icon: CheckCircle },
];

const STATUS_ORDER: OrderStatus[] = ["pending", "confirmed", "preparing", "shipped", "delivered"];

export default function OrderDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await api.get<Order>(`/orders/${id}`);
      if (res.success && res.data) setOrder(res.data);
      setIsLoading(false);
    })();
  }, [id]);

  const handleCancel = async () => {
    Alert.alert("Cancelar Pedido", "¿Estás seguro de que quieres cancelar este pedido?", [
      { text: "No", style: "cancel" },
      {
        text: "Sí, cancelar",
        style: "destructive",
        onPress: async () => {
          const res = await api.post(`/orders/${id}/cancel`);
          if (res.success) {
            setOrder((o) => o ? { ...o, status: "cancelled" } : null);
          } else {
            Alert.alert("Error", "No se pudo cancelar el pedido");
          }
        },
      },
    ]);
  };

  const handleReorder = async () => {
    const res = await api.post(`/orders/${id}/reorder`);
    if (res.success) {
      router.push("/cart");
    } else {
      Alert.alert("Error", "No se pudo repetir el pedido");
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#ea580c" />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-muted-foreground text-lg">Pedido no encontrado</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-primary font-semibold">Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const currentStepIndex = order.status === "cancelled" ? -1 : STATUS_ORDER.indexOf(order.status);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="px-4 py-3 flex-row items-center border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <ArrowLeft size={24} className="text-foreground" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground ml-2">Pedido #{order.id.slice(0, 8)}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Status */}
        <View className="bg-card rounded-2xl border border-border p-4 mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-foreground font-bold text-lg">Estado</Text>
            <Text className="text-muted-foreground text-sm">
              {new Date(order.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
            </Text>
          </View>

          {/* Timeline */}
          {order.status !== "cancelled" ? (
            <View className="mt-3">
              {TIMELINE_STEPS.map((step, idx) => {
                const isCompleted = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const StepIcon = step.icon;
                return (
                  <View key={step.status} className="flex-row items-start mb-1">
                    <View className="items-center mr-3">
                      <View className={`w-8 h-8 rounded-full items-center justify-center ${isCompleted ? "bg-primary" : "bg-muted"}`}>
                        <StepIcon size={16} color={isCompleted ? "white" : "#a8a29e"} />
                      </View>
                      {idx < TIMELINE_STEPS.length - 1 && (
                        <View className={`w-0.5 h-8 ${isCompleted ? "bg-primary" : "bg-muted"}`} />
                      )}
                    </View>
                    <View className="flex-1 pt-1">
                      <Text className={`font-semibold ${isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.label}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="flex-row items-center gap-2 mt-2 bg-red-50 p-3 rounded-xl">
              <XCircle size={20} className="text-red-600" />
              <Text className="text-red-600 font-semibold">Pedido cancelado</Text>
            </View>
          )}
        </View>

        {/* Items */}
        {order.items && order.items.length > 0 && (
          <View className="bg-card rounded-2xl border border-border p-4 mb-4">
            <Text className="text-foreground font-bold text-lg mb-3">Productos</Text>
            {order.items.map((item) => (
              <View key={item.id} className="flex-row items-center py-3 border-b border-border last:border-0">
                <Image
                  source={{ uri: item.product_image || "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=200" }}
                  className="w-14 h-14 rounded-xl"
                  resizeMode="cover"
                />
                <View className="flex-1 ml-3">
                  <Text className="text-foreground font-medium" numberOfLines={1}>{item.product_name}</Text>
                  <Text className="text-muted-foreground text-xs">{item.weight_label} × {item.quantity}</Text>
                </View>
                <Text className="text-foreground font-semibold">€{Number(item.line_total).toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Price Summary */}
        <View className="bg-card rounded-2xl border border-border p-4 mb-4">
          <Text className="text-foreground font-bold text-lg mb-3">Resumen</Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-muted-foreground">Subtotal</Text>
            <Text className="text-foreground">€{Number(order.subtotal).toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-muted-foreground">Envío</Text>
            <Text className="text-foreground">€{Number(order.delivery_fee).toFixed(2)}</Text>
          </View>
          {Number(order.discount_amount) > 0 && (
            <View className="flex-row justify-between mb-2">
              <Text className="text-green-600">Descuento</Text>
              <Text className="text-green-600">-€{Number(order.discount_amount).toFixed(2)}</Text>
            </View>
          )}
          <View className="border-t border-border mt-2 pt-3 flex-row justify-between">
            <Text className="text-foreground font-bold text-lg">Total</Text>
            <Text className="text-primary font-bold text-lg">€{Number(order.total).toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View className="absolute bottom-0 left-0 right-0 bg-card border-t border-border px-6 py-4 flex-row gap-3">
        {(order.status === "pending" || order.status === "confirmed") && (
          <TouchableOpacity onPress={handleCancel} className="flex-1 border border-destructive py-3 rounded-xl items-center">
            <Text className="text-destructive font-bold">Cancelar</Text>
          </TouchableOpacity>
        )}
        {order.status === "delivered" && (
          <TouchableOpacity onPress={handleReorder} className="flex-1 bg-primary py-3 rounded-xl items-center flex-row justify-center gap-2">
            <RotateCcw size={18} className="text-primary-foreground" />
            <Text className="text-primary-foreground font-bold">Repetir Pedido</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
