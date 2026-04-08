import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, CreditCard, MapPin, Check, Wallet, Truck } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useStripePay } from "@/hooks/useStripePay";
import { api } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import type { Address } from "@/lib/types";

type PaymentMethod = "card" | "cash" | "bizum";

const DELIVERY_FEE = 3.99;
const FREE_DELIVERY_THRESHOLD = 40;

export default function PaymentScreen() {
  const router = useRouter();
  const { subtotal, clearCart, appliedPromo } = useCart();
  const { user } = useAuth();
  const { payWithCard, CardField } = useStripePay();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [isPlacing, setIsPlacing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const discount = appliedPromo?.free_delivery ? 0 : (appliedPromo?.discount_amount || 0);
  const deliveryFee = (subtotal >= FREE_DELIVERY_THRESHOLD || appliedPromo?.free_delivery) ? 0 : DELIVERY_FEE;
  const total = subtotal - discount + deliveryFee;

  // Refresh addresses every time screen is focused
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const res = await api.get<Address[]>("/users/addresses");
        if (res.success && res.data) {
          setAddresses(res.data);
          if (!selectedAddress) {
            const defaultAddr = res.data.find((a) => a.is_default) || res.data[0];
            if (defaultAddr) setSelectedAddress(defaultAddr);
          }
        }
        setIsLoading(false);
      })();
    }, [])
  );

  const handlePlaceOrder = async () => {
    if (!selectedAddress?.id) {
      Alert.alert("Error", "Selecciona una dirección de entrega");
      return;
    }

    setIsPlacing(true);
    try {
      const res = await api.post("/orders/", {
        address_id: selectedAddress.id,
        payment_method: paymentMethod,
        ...(appliedPromo ? { promo_code: appliedPromo.code } : {}),
      });

      if (!res.success || !res.data) {
        Alert.alert("Error", res.error?.message || "No se pudo realizar el pedido");
        return;
      }

      const orderId = res.data.id;

      if (paymentMethod === "card") {
        const piRes = await api.post<{ clientSecret: string; paymentIntentId: string }>("/payments/intent", {
          orderId,
          amount: total,
          currency: "eur",
        });

        if (!piRes.success || !piRes.data?.clientSecret) {
          Alert.alert("Error", "No se pudo iniciar el pago con tarjeta");
          return;
        }

        const result = await payWithCard(piRes.data.clientSecret, user);

        if (result.cancelled) {
          Alert.alert("Pago Cancelado", "Puedes reintentar el pago desde tus pedidos.");
          return;
        }

        if (!result.success) {
          Alert.alert("Error de Pago", result.error || "El pago no se completó");
          return;
        }

        clearCart();
        Alert.alert(
          "Pago Realizado",
          `Tu pedido #${orderId.slice(0, 8)} ha sido pagado correctamente.`,
          [{ text: "Ver Pedido", onPress: () => router.replace("/(tabs)/orders") }],
        );
        return;
      }

      clearCart();
      Alert.alert("Pedido Confirmado", `Tu pedido #${orderId.slice(0, 8)} ha sido realizado`, [
        { text: "Ver Pedido", onPress: () => router.replace("/(tabs)/orders") },
      ]);
    } finally {
      setIsPlacing(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#ea580c" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="px-4 py-3 flex-row items-center border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <ArrowLeft size={24} className="text-foreground" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground ml-2">Checkout</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        {/* Delivery Address */}
        <View className="bg-card rounded-2xl border border-border p-4 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <MapPin size={18} className="text-primary" />
              <Text className="text-foreground font-bold">Dirección de Entrega</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/addresses")}>
              <Text className="text-primary text-sm font-medium">Cambiar</Text>
            </TouchableOpacity>
          </View>
          {selectedAddress ? (
            <View className="bg-muted/50 rounded-xl p-3">
              <Text className="text-foreground font-medium">{selectedAddress.label}</Text>
              <Text className="text-muted-foreground text-sm mt-1">
                {selectedAddress.street}, {selectedAddress.city} {selectedAddress.postcode}
              </Text>
            </View>
          ) : (
            <TouchableOpacity onPress={() => router.push("/addresses")} className="bg-muted/50 rounded-xl p-4 items-center">
              <Text className="text-primary font-medium">Añadir dirección</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Delivery Estimate */}
        <View className="bg-card rounded-2xl border border-border p-4 mb-4">
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
              <Truck size={24} color="#ea580c" />
            </View>
            <View className="flex-1">
              <Text className="text-foreground font-bold text-base">Envío estimado</Text>
              <Text className="text-muted-foreground text-sm mt-0.5">
                Tu pedido será entregado en un plazo de 48 a 72 horas.
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View className="bg-card rounded-2xl border border-border p-4 mb-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Wallet size={18} className="text-primary" />
            <Text className="text-foreground font-bold">Método de Pago</Text>
          </View>
          {(["card"] as PaymentMethod[]).map((method) => {
            const labels: Record<string, string> = { card: "Tarjeta", cash: "Efectivo", bizum: "Bizum" };
            const icons: Record<string, any> = { card: CreditCard, cash: Wallet, bizum: Wallet };
            const Icon = icons[method];
            const isSelected = paymentMethod === method;
            return (
              <TouchableOpacity
                key={method}
                onPress={() => setPaymentMethod(method)}
                className={`flex-row items-center p-3 rounded-xl mb-2 border ${isSelected ? "border-primary bg-primary/10" : "border-border"}`}
              >
                <Icon size={20} className={isSelected ? "text-primary" : "text-muted-foreground"} />
                <Text className={`ml-3 flex-1 font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>
                  {labels[method]}
                </Text>
                {isSelected && (
                  <View className="w-5 h-5 bg-primary rounded-full items-center justify-center">
                    <Check size={12} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          {Platform.OS === "web" && paymentMethod === "card" && CardField && (
            <View className="mt-3 p-3 border border-border rounded-xl bg-muted/30">
              <CardField />
            </View>
          )}
        </View>

        {/* Order Summary */}
        <View className="bg-card rounded-2xl border border-border p-4">
          <Text className="text-foreground font-bold text-lg mb-3">Resumen</Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-muted-foreground">Subtotal</Text>
            <Text className="text-foreground">€{subtotal.toFixed(2)}</Text>
          </View>
          {discount > 0 && (
            <View className="flex-row justify-between mb-2">
              <Text className="text-green-600">Descuento ({appliedPromo?.code})</Text>
              <Text className="text-green-600 font-medium">-€{discount.toFixed(2)}</Text>
            </View>
          )}
          <View className="flex-row justify-between mb-2">
            <Text className="text-muted-foreground">Envío</Text>
            <Text className={deliveryFee === 0 ? "text-green-600 font-medium" : "text-foreground"}>
              {deliveryFee === 0 ? "GRATIS" : `€${deliveryFee.toFixed(2)}`}
            </Text>
          </View>
          <View className="border-t border-border mt-2 pt-3 flex-row justify-between">
            <Text className="text-foreground font-bold text-lg">Total</Text>
            <Text className="text-primary font-bold text-lg">€{total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-card border-t border-border px-6 py-4">
        <TouchableOpacity
          onPress={handlePlaceOrder}
          disabled={isPlacing}
          className="bg-primary py-4 rounded-xl items-center"
        >
          {isPlacing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-primary-foreground font-bold text-lg">Pagar €{total.toFixed(2)}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
