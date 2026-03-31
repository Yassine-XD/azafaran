import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, CreditCard, MapPin, Check, Truck, Wallet, Clock } from "lucide-react-native";
import { useRouter } from "expo-router";
import { api } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import type { Address, DeliverySlot } from "@/lib/types";

type PaymentMethod = "card" | "cash" | "bizum";

const DELIVERY_FEE = 2.99;
const FREE_DELIVERY_THRESHOLD = 30;

export default function PaymentScreen() {
  const router = useRouter();
  const { subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [slots, setSlots] = useState<DeliverySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<DeliverySlot | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [isPlacing, setIsPlacing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  useEffect(() => {
    (async () => {
      const [addrRes, slotRes] = await Promise.all([
        api.get<Address[]>("/users/addresses"),
        api.get<DeliverySlot[]>("/delivery-slots/available"),
      ]);
      if (addrRes.success && addrRes.data) {
        setAddresses(addrRes.data);
        const defaultAddr = addrRes.data.find((a) => a.is_default) || addrRes.data[0];
        if (defaultAddr) setSelectedAddress(defaultAddr);
      }
      if (slotRes.success && slotRes.data) {
        setSlots(slotRes.data);
        if (slotRes.data.length > 0) setSelectedSlot(slotRes.data[0]);
      }
      setIsLoading(false);
    })();
  }, []);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert("Error", "Selecciona una dirección de entrega");
      return;
    }
    if (!selectedSlot) {
      Alert.alert("Error", "Selecciona un horario de entrega");
      return;
    }

    setIsPlacing(true);
    const res = await api.post("/orders/", {
      address_id: selectedAddress.id,
      delivery_slot_id: selectedSlot.id,
      payment_method: paymentMethod,
    });
    setIsPlacing(false);

    if (res.success && res.data) {
      // If card payment, create payment intent
      if (paymentMethod === "card") {
        const piRes = await api.post("/payments/intent", {
          orderId: res.data.id,
          amount: total,
          currency: "eur",
        });
        if (piRes.success) {
          // In production, use Stripe SDK with piRes.data.clientSecret
          Alert.alert(
            "Pago",
            "En la versión final, aquí se abrirá la pasarela de Stripe. Pedido creado correctamente.",
            [{ text: "OK", onPress: () => { clearCart(); router.replace("/(tabs)/orders"); } }],
          );
          return;
        }
      }
      // Cash/bizum - order placed directly
      Alert.alert("Pedido Confirmado", `Tu pedido #${res.data.id.slice(0, 8)} ha sido realizado`, [
        { text: "Ver Pedido", onPress: () => { clearCart(); router.replace("/(tabs)/orders"); } },
      ]);
    } else {
      Alert.alert("Error", res.error?.message || "No se pudo realizar el pedido");
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

        {/* Delivery Slot */}
        <View className="bg-card rounded-2xl border border-border p-4 mb-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Clock size={18} className="text-primary" />
            <Text className="text-foreground font-bold">Horario de Entrega</Text>
          </View>
          {slots.length === 0 ? (
            <Text className="text-muted-foreground text-sm">No hay horarios disponibles</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {slots.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id;
                const date = new Date(slot.slot_date);
                const dayLabel = date.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" });
                return (
                  <TouchableOpacity
                    key={slot.id}
                    onPress={() => setSelectedSlot(slot)}
                    className={`mr-3 px-4 py-3 rounded-xl border ${isSelected ? "border-primary bg-primary/10" : "border-border bg-muted/50"}`}
                  >
                    <Text className={`text-xs font-medium ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                      {dayLabel}
                    </Text>
                    <Text className={`text-sm font-bold mt-1 ${isSelected ? "text-primary" : "text-foreground"}`}>
                      {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Payment Method */}
        <View className="bg-card rounded-2xl border border-border p-4 mb-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Wallet size={18} className="text-primary" />
            <Text className="text-foreground font-bold">Método de Pago</Text>
          </View>
          {(["card", "cash", "bizum"] as PaymentMethod[]).map((method) => {
            const labels: Record<PaymentMethod, string> = { card: "Tarjeta", cash: "Efectivo", bizum: "Bizum" };
            const icons: Record<PaymentMethod, any> = { card: CreditCard, cash: Wallet, bizum: Wallet };
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
        </View>

        {/* Order Summary */}
        <View className="bg-card rounded-2xl border border-border p-4">
          <Text className="text-foreground font-bold text-lg mb-3">Resumen</Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-muted-foreground">Subtotal</Text>
            <Text className="text-foreground">€{subtotal.toFixed(2)}</Text>
          </View>
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
