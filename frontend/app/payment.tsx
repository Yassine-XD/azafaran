import React, { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, CreditCard, MapPin, Check, Truck, Wallet, Clock, CalendarDays, Sun, Sunset } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useStripePay } from "@/hooks/useStripePay";
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
  const { payWithCard, CardField } = useStripePay();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [slots, setSlots] = useState<DeliverySlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<DeliverySlot | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [isPlacing, setIsPlacing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const grouped: Record<string, DeliverySlot[]> = {};
    for (const slot of slots) {
      const d = slot.slot_date;
      if (!grouped[d]) grouped[d] = [];
      grouped[d].push(slot);
    }
    return grouped;
  }, [slots]);

  const availableDates = useMemo(() => Object.keys(slotsByDate).sort(), [slotsByDate]);
  const timeSlotsForDate = selectedDate ? slotsByDate[selectedDate] || [] : [];

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    const weekday = date.toLocaleDateString("es-ES", { weekday: "short" });
    const day = date.getDate();
    const month = date.toLocaleDateString("es-ES", { month: "short" });
    return { weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1), day, month };
  };

  // Group time slots by period (morning < 14:00, afternoon >= 14:00)
  const { morning, afternoon } = useMemo(() => {
    const m: DeliverySlot[] = [];
    const a: DeliverySlot[] = [];
    for (const slot of timeSlotsForDate) {
      const hour = parseInt(slot.start_time.slice(0, 2), 10);
      if (hour < 14) m.push(slot);
      else a.push(slot);
    }
    return { morning: m, afternoon: a };
  }, [timeSlotsForDate]);

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
        // Auto-select first available date and its first time slot
        if (slotRes.data.length > 0) {
          const firstDate = slotRes.data[0].slot_date;
          setSelectedDate(firstDate);
          setSelectedSlot(slotRes.data[0]);
        }
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

        // Payment successful — webhook will confirm the order
        clearCart();
        Alert.alert(
          "Pago Realizado",
          `Tu pedido #${orderId.slice(0, 8)} ha sido pagado correctamente.`,
          [{ text: "Ver Pedido", onPress: () => router.replace("/(tabs)/orders") }],
        );
        return;
      }

      // Cash/bizum — order placed directly
      clearCart();
      Alert.alert("Pedido Confirmado", `Tu pedido #${orderId.slice(0, 8)} ha sido realizado`, [
        { text: "Ver Pedido", onPress: () => router.replace("/(tabs)/orders") },
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

        {/* Delivery Date & Time */}
        <View className="bg-card rounded-2xl border border-border p-4 mb-4">
          <View className="flex-row items-center gap-2 mb-1">
            <CalendarDays size={18} className="text-primary" />
            <Text className="text-foreground font-bold">Fecha de Entrega</Text>
          </View>
          <Text className="text-muted-foreground text-xs mb-3">Mínimo 2 días de preparación</Text>

          {availableDates.length === 0 ? (
            <Text className="text-muted-foreground text-sm">No hay fechas disponibles</Text>
          ) : (
            <>
              {/* Date Picker */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                {availableDates.map((dateStr) => {
                  const isSelected = selectedDate === dateStr;
                  const { weekday, day, month } = formatDateLabel(dateStr);
                  return (
                    <TouchableOpacity
                      key={dateStr}
                      onPress={() => {
                        setSelectedDate(dateStr);
                        // Auto-select first time slot for this date
                        const firstSlot = slotsByDate[dateStr]?.[0];
                        setSelectedSlot(firstSlot || null);
                      }}
                      className={`mr-3 w-16 py-3 rounded-xl border items-center ${
                        isSelected ? "border-primary bg-primary" : "border-border bg-muted/50"
                      }`}
                    >
                      <Text className={`text-xs font-medium ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`}>
                        {weekday}
                      </Text>
                      <Text className={`text-xl font-bold my-0.5 ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>
                        {day}
                      </Text>
                      <Text className={`text-xs ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`}>
                        {month}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Time Slot Picker */}
              {timeSlotsForDate.length === 0 ? (
                <Text className="text-muted-foreground text-sm">No hay horarios para esta fecha</Text>
              ) : (
                <View className="gap-4">
                  {morning.length > 0 && (
                    <View>
                      <View className="flex-row items-center gap-2 mb-2">
                        <Sun size={14} className="text-amber-500" />
                        <Text className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">Mañana</Text>
                      </View>
                      <View className="flex-row flex-wrap gap-2">
                        {morning.map((slot) => {
                          const isSelected = selectedSlot?.id === slot.id;
                          const spotsLeft = slot.max_orders - slot.booked_count;
                          return (
                            <TouchableOpacity
                              key={slot.id}
                              onPress={() => setSelectedSlot(slot)}
                              className={`px-4 py-2.5 rounded-full border ${
                                isSelected ? "border-primary bg-primary" : "border-border bg-muted/50"
                              }`}
                            >
                              <Text className={`text-sm font-semibold ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>
                                {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                              </Text>
                              {spotsLeft <= 3 && (
                                <Text className={`text-[10px] text-center mt-0.5 ${isSelected ? "text-primary-foreground/70" : "text-red-500"}`}>
                                  {spotsLeft === 1 ? "¡Último!" : `${spotsLeft} plazas`}
                                </Text>
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  )}

                  {afternoon.length > 0 && (
                    <View>
                      <View className="flex-row items-center gap-2 mb-2">
                        <Sunset size={14} className="text-orange-500" />
                        <Text className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">Tarde</Text>
                      </View>
                      <View className="flex-row flex-wrap gap-2">
                        {afternoon.map((slot) => {
                          const isSelected = selectedSlot?.id === slot.id;
                          const spotsLeft = slot.max_orders - slot.booked_count;
                          return (
                            <TouchableOpacity
                              key={slot.id}
                              onPress={() => setSelectedSlot(slot)}
                              className={`px-4 py-2.5 rounded-full border ${
                                isSelected ? "border-primary bg-primary" : "border-border bg-muted/50"
                              }`}
                            >
                              <Text className={`text-sm font-semibold ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>
                                {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                              </Text>
                              {spotsLeft <= 3 && (
                                <Text className={`text-[10px] text-center mt-0.5 ${isSelected ? "text-primary-foreground/70" : "text-red-500"}`}>
                                  {spotsLeft === 1 ? "¡Último!" : `${spotsLeft} plazas`}
                                </Text>
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  )}
                </View>
              )}
            </>
          )}
        </View>

        {/* Payment Method */}
        <View className="bg-card rounded-2xl border border-border p-4 mb-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Wallet size={18} className="text-primary" />
            <Text className="text-foreground font-bold">Método de Pago</Text>
          </View>
          {(["card"] as PaymentMethod[]).map((method) => {
            const labels: Record<PaymentMethod, string> = { card: "Tarjeta"};
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

          {/* Web: show Stripe card input when card is selected */}
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
