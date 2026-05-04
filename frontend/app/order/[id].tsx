import { useEffect, useState } from "react";
import { ScrollView, View, Pressable, Alert } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { ArrowLeft, Repeat, MapPin } from "lucide-react-native";

import { Display, Heading2, Heading3, Body, Small, Caption } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";
import { firstImage } from "@/lib/productImage";
import type { Order } from "@/lib/types";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);

const STATUS_KEYS: Record<string, string> = {
  pending: "rebuild.orders.status_pending",
  confirmed: "rebuild.orders.status_confirmed",
  preparing: "rebuild.orders.status_preparing",
  shipped: "rebuild.orders.status_shipped",
  delivered: "rebuild.orders.status_delivered",
  cancelled: "rebuild.orders.status_cancelled",
};

export default function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLang();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get<Order>(`/orders/${id}`).then((r) => {
      if (r.success && r.data) setOrder(r.data);
      setLoading(false);
    });
  }, [id]);

  const onReorder = async () => {
    if (!order) return;
    const r = await api.post(`/orders/${order.id}/reorder`);
    if (r.success) {
      router.push("/cart");
    } else {
      Alert.alert(t("rebuild.orders.reorder_failed"), r.error?.message || t("rebuild.product.add_failed_retry"));
    }
  };

  if (loading) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-background">
        <Stack.Screen options={{ headerShown: false }} />
        <View className="px-5 pt-3 gap-3">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-32 rounded-2xl mt-4" />
          <Skeleton className="h-48 rounded-2xl" />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-background items-center justify-center px-8">
        <Body className="text-muted-foreground">Pedido no encontrado.</Body>
        <Button title={t("common_back") || "Volver"} variant="secondary" size="md" className="mt-4" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="px-5 py-3 flex-row items-center gap-3">
        <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full bg-muted">
          <ArrowLeft size={20} color="#0B0B0C" strokeWidth={2} />
        </Pressable>
        <View className="flex-1">
          <Caption className="uppercase tracking-wide text-muted-foreground">
            #{(order as any).order_number}
          </Caption>
          <Display>{t(STATUS_KEYS[order.status] ?? "")}</Display>
        </View>
      </View>

      <ScrollView contentContainerClassName="px-5 pb-32">
        <Small className="text-muted-foreground mt-1">
          {new Date(order.created_at).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Small>

        {/* Address */}
        {order.address ? (
          <View className="mt-5 p-4 rounded-2xl bg-surface border border-border flex-row gap-3">
            <MapPin size={18} color="#0B0B0C" strokeWidth={1.8} />
            <View className="flex-1">
              <Body className="font-body-semibold">{order.address.label}</Body>
              <Small className="text-muted-foreground">
                {order.address.street}, {order.address.postcode} {order.address.city}
              </Small>
            </View>
          </View>
        ) : null}

        {/* Items */}
        <View className="mt-6">
          <Heading2>Artículos</Heading2>
          <View className="mt-3 gap-2">
            {(order.items ?? []).map((item) => {
              const snap = (item as any).product_snapshot ?? {};
              const img = firstImage(snap.images) || (item as any).product_image;
              return (
                <View key={item.id} className="flex-row p-3 rounded-2xl bg-card border border-border">
                  <View className="w-16 h-16 rounded-xl overflow-hidden bg-muted">
                    {img ? (
                      <Image source={{ uri: img }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                    ) : null}
                  </View>
                  <View className="flex-1 ml-3 justify-between">
                    <View>
                      <Body className="font-body-semibold" numberOfLines={2}>
                        {snap.name ?? (item as any).product_name}
                      </Body>
                      <Small className="text-muted-foreground">
                        {snap.variant_label ?? (item as any).weight_label} × {item.quantity}
                      </Small>
                    </View>
                  </View>
                  <Body className="font-mono-medium ml-2">{fmt(Number(item.line_total))}</Body>
                </View>
              );
            })}
          </View>
        </View>

        {/* Totals */}
        <View className="mt-6 p-4 rounded-2xl bg-surface border border-border">
          <View className="flex-row justify-between">
            <Body className="text-muted-foreground">{t("rebuild.cart.subtotal")}</Body>
            <Body className="font-mono-medium">{fmt(Number(order.subtotal))}</Body>
          </View>
          {order.delivery_fee ? (
            <View className="mt-2 flex-row justify-between">
              <Body className="text-muted-foreground">Envío</Body>
              <Body className="font-mono-medium">{fmt(Number(order.delivery_fee))}</Body>
            </View>
          ) : null}
          {order.discount_amount ? (
            <View className="mt-2 flex-row justify-between">
              <Body className="text-halal">{t("rebuild.cart.discount")}</Body>
              <Body className="font-mono-medium text-halal">−{fmt(Number(order.discount_amount))}</Body>
            </View>
          ) : null}
          <View className="mt-3 pt-3 border-t border-border flex-row justify-between items-baseline">
            <Heading3>{t("rebuild.cart.total")}</Heading3>
            <Body className="font-mono-semibold text-h2">{fmt(Number(order.total))}</Body>
          </View>
        </View>
      </ScrollView>

      {/* Sticky reorder */}
      <View className="absolute bottom-0 left-0 right-0 px-5 pt-3 pb-6 bg-background border-t border-border shadow-sticky">
        <Button
          title={t("rebuild.orders.reorder")}
          variant="primary"
          size="lg"
          fullWidth
          leftIcon={<Repeat size={18} color="#FFFFFF" strokeWidth={2} />}
          onPress={onReorder}
        />
      </View>
    </SafeAreaView>
  );
}
