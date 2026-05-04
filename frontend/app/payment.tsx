import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  CheckCircle2,
  Wallet,
  Plus,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useStripePay } from "@/hooks/useStripePay";
import { api } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { Gradient } from "@/components/ui";
import type { Address } from "@/lib/types";
import { brand, shadows } from "@/theme";

type PaymentMethod = "card" | "cash" | "bizum";

const DELIVERY_FEE = 3.99;
const FREE_DELIVERY_THRESHOLD = 40;

export default function PaymentScreen() {
  const router = useRouter();
  const { subtotal, clearCart, appliedPromo } = useCart();
  const { user } = useAuth();
  const { t } = useLang();
  const { payWithCard, CardField } = useStripePay();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [isPlacing, setIsPlacing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const initialLoadDone = useRef(false);

  const discount = appliedPromo?.free_delivery
    ? 0
    : appliedPromo?.discount_amount || 0;
  const deliveryFee =
    subtotal >= FREE_DELIVERY_THRESHOLD || appliedPromo?.free_delivery
      ? 0
      : DELIVERY_FEE;
  const total = subtotal - discount + deliveryFee;

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const res = await api.get<Address[]>("/users/addresses");
        if (res.success && res.data) {
          setAddresses(res.data);
          if (!initialLoadDone.current) {
            const defaultAddr = res.data.find((a) => a.is_default) || res.data[0];
            if (defaultAddr) setSelectedAddress(defaultAddr);
            initialLoadDone.current = true;
          }
        }
        setIsLoading(false);
      })();
    }, []),
  );

  const showSuccessAndExit = (orderId: string) => {
    setSuccess(true);
    setTimeout(() => {
      clearCart();
      setSuccess(false);
      router.replace("/(tabs)/orders");
    }, 1500);
  };

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
        const piRes = await api.post<{
          clientSecret: string;
          paymentIntentId: string;
        }>("/payments/intent", { orderId });

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

        showSuccessAndExit(orderId);
        return;
      }

      showSuccessAndExit(orderId);
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Ocurrió un error inesperado.");
    } finally {
      setIsPlacing(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={brand.burgundy[600]} />
      </SafeAreaView>
    );
  }

  const methods: { id: PaymentMethod; label: string; sub: string; icon: typeof CreditCard }[] = [
    {
      id: "card",
      label: "Tarjeta",
      sub: user?.email ? "Pago seguro con Stripe" : "Visa · Mastercard",
      icon: CreditCard,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center gap-3 pt-2 pb-5">
          <Pressable
            onPress={() => router.back()}
            className="w-11 h-11 rounded-2xl bg-card border border-border items-center justify-center"
            style={shadows.card}
          >
            <ArrowLeft size={20} color={brand.coal[900]} />
          </Pressable>
          <Text className="font-display text-2xl text-foreground">Checkout</Text>
        </View>

        {/* Address card */}
        <View
          className="bg-card rounded-3xl border border-border p-5 mb-5"
          style={shadows.card}
        >
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <MapPin size={14} color={brand.burgundy[600]} />
              <Text className="font-body-bold text-[11px] uppercase tracking-widest text-muted-foreground">
                Entregar en
              </Text>
            </View>
            <Pressable onPress={() => router.push("/addresses")} hitSlop={6}>
              <Text className="font-body-bold text-xs text-primary">Cambiar</Text>
            </Pressable>
          </View>
          {selectedAddress ? (
            <>
              <Text className="font-body-bold text-foreground">
                {selectedAddress.label} ·{" "}
                {user ? `${user.first_name} ${user.last_name}` : ""}
              </Text>
              <Text className="font-body text-sm text-muted-foreground">
                {selectedAddress.street}, {selectedAddress.city}{" "}
                {selectedAddress.postcode}
              </Text>
            </>
          ) : (
            <Pressable
              onPress={() => router.push("/addresses")}
              className="bg-muted/50 rounded-xl p-3 mt-1 items-center"
            >
              <Text className="font-body-bold text-primary">Añadir dirección</Text>
            </Pressable>
          )}
        </View>

        {/* Payment method */}
        <Text className="font-body-bold text-[11px] uppercase tracking-widest text-muted-foreground mb-3">
          Método de pago
        </Text>
        <View className="gap-2 mb-5">
          {methods.map((m) => {
            const Icon = m.icon;
            const selected = paymentMethod === m.id;
            return (
              <Pressable
                key={m.id}
                onPress={() => setPaymentMethod(m.id)}
                className={`flex-row items-center gap-3 p-4 rounded-2xl bg-card border-2 ${
                  selected ? "border-primary" : "border-border"
                }`}
                style={selected ? shadows.button : shadows.card}
              >
                <View className="w-11 h-11 rounded-xl bg-primary/10 items-center justify-center">
                  <Icon size={20} color={brand.burgundy[600]} />
                </View>
                <View className="flex-1">
                  <Text className="font-body-bold text-sm text-foreground">{m.label}</Text>
                  <Text className="font-body text-xs text-muted-foreground">{m.sub}</Text>
                </View>
                <View
                  className={`w-5 h-5 rounded-full ${
                    selected ? "bg-primary border-2 border-primary" : "border-2 border-border"
                  }`}
                />
              </Pressable>
            );
          })}
          <Pressable
            disabled
            className="flex-row items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-border opacity-60"
          >
            <Plus size={16} color={brand.textSecondary} />
            <Text className="font-body-bold text-sm text-muted-foreground">
              Añadir nueva tarjeta
            </Text>
          </Pressable>

          {Platform.OS === "web" && paymentMethod === "card" && CardField && (
            <View
              className="mt-1 p-3 border border-border rounded-2xl bg-muted/30"
            >
              <CardField />
            </View>
          )}
        </View>

        {/* Summary */}
        <View
          className="bg-card rounded-3xl border border-border p-5"
          style={shadows.card}
        >
          <Row label={t("cart.subtotal")} value={`€${subtotal.toFixed(2)}`} />
          {discount > 0 && (
            <Row
              label={`${t("cart.discount")} (${appliedPromo?.code})`}
              value={`-€${discount.toFixed(2)}`}
              positive
            />
          )}
          <Row
            label={t("cart.delivery")}
            value={deliveryFee === 0 ? t("cart.delivery_free") : `€${deliveryFee.toFixed(2)}`}
            positive={deliveryFee === 0}
          />
          <Row label="Tax" value="€0.00" />
          <View className="border-t border-border pt-3 mt-3 flex-row items-center justify-between">
            <Text className="font-body-bold text-sm text-foreground">{t("cart.total")}</Text>
            <Text className="font-display text-xl text-primary">
              €{total.toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky place order */}
      <View
        className="absolute bottom-0 left-0 right-0 px-4 py-4 bg-background/95 border-t border-border"
        style={shadows.sticky}
      >
        <Pressable
          onPress={handlePlaceOrder}
          disabled={isPlacing || !selectedAddress}
          className="rounded-2xl overflow-hidden"
          style={shadows.button}
        >
          <Gradient
            name="primary"
            style={{
              height: 56,
              alignItems: "center",
              justifyContent: "center",
              opacity: isPlacing || !selectedAddress ? 0.6 : 1,
            }}
          >
            {isPlacing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="font-body-bold text-base text-white">
                Hacer pedido · €{total.toFixed(2)}
              </Text>
            )}
          </Gradient>
        </Pressable>
      </View>

      {/* Success overlay */}
      <Modal visible={success} transparent animationType="fade" statusBarTranslucent>
        <View className="flex-1 items-center justify-center bg-coal/55 px-6">
          <View
            className="bg-card rounded-3xl p-8 items-center w-full max-w-sm"
            style={shadows.cardLift}
          >
            <View className="w-16 h-16 rounded-full bg-gold/20 items-center justify-center mb-3">
              <CheckCircle2 size={36} color={brand.gold[600]} strokeWidth={2.4} />
            </View>
            <Text className="font-display text-2xl text-foreground">
              ¡Pedido realizado!
            </Text>
            <Text className="font-body text-sm text-muted-foreground text-center mt-1">
              Tu carne fresca está en camino 🚚
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between py-1">
      <Text className="font-body text-sm text-muted-foreground">{label}</Text>
      <Text
        className={`font-body-bold text-sm ${positive ? "text-gold-deep" : "text-foreground"}`}
      >
        {value}
      </Text>
    </View>
  );
}
