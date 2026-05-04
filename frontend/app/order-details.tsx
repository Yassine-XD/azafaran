import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  ChefHat,
  RotateCw,
  X,
} from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { api } from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";
import { Gradient } from "@/components/ui";
import type { Order, OrderStatus } from "@/lib/types";
import { brand, shadows } from "@/theme";

const STATUS_ORDER: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "delivered",
];

export default function OrderDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLang();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const TIMELINE_STEPS: { status: OrderStatus; label: string; icon: typeof Clock }[] = [
    { status: "pending", label: t("order_details.timeline_placed"), icon: Clock },
    { status: "confirmed", label: t("order_details.timeline_confirmed"), icon: Package },
    { status: "preparing", label: t("order_details.timeline_preparing"), icon: ChefHat },
    { status: "shipped", label: t("order_details.timeline_shipped"), icon: Truck },
    { status: "delivered", label: t("order_details.timeline_delivered"), icon: CheckCircle2 },
  ];

  useEffect(() => {
    (async () => {
      const res = await api.get<Order>(`/orders/${id}`);
      if (res.success && res.data) setOrder(res.data);
      setIsLoading(false);
    })();
  }, [id]);

  const handleCancel = async () => {
    Alert.alert(
      t("order_details.cancel_title"),
      t("order_details.cancel_confirm"),
      [
        { text: t("order_details.cancel_no"), style: "cancel" },
        {
          text: t("order_details.cancel_yes"),
          style: "destructive",
          onPress: async () => {
            const res = await api.post(`/orders/${id}/cancel`);
            if (res.success) {
              setOrder((o) => (o ? { ...o, status: "cancelled" } : null));
            } else {
              Alert.alert(t("common.error"), t("order_details.cancel_error"));
            }
          },
        },
      ],
    );
  };

  const handleReorder = async () => {
    const res = await api.post(`/orders/${id}/reorder`);
    if (res.success) {
      router.push("/cart");
    } else {
      Alert.alert(t("common.error"), t("order_details.reorder_error"));
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={brand.burgundy[600]} />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
        <Text className="font-body text-muted-foreground">
          {t("order_details.not_found")}
        </Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="font-body-bold text-primary">
            {t("order_details.back")}
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const cancelled = order.status === "cancelled";
  const currentStep = cancelled ? -1 : STATUS_ORDER.indexOf(order.status);

  const showCancel = order.status === "pending" || order.status === "confirmed";
  const showReorder = order.status === "delivered";

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-start justify-between pt-2 pb-5">
          <View className="flex-row items-start gap-3">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 rounded-2xl bg-card border border-border items-center justify-center"
              style={shadows.card}
            >
              <ArrowLeft size={18} color={brand.coal[900]} />
            </Pressable>
            <View>
              <Text className="font-body-bold text-[10px] uppercase tracking-widest text-muted-foreground">
                #{order.id.slice(0, 8)}
              </Text>
              <Text className="font-display text-2xl text-foreground mt-0.5">
                {t("order_details.title")}
              </Text>
            </View>
          </View>
        </View>

        {/* Status card */}
        <View
          className="bg-card rounded-3xl border border-border p-5 mb-4"
          style={shadows.card}
        >
          <View className="flex-row items-center justify-between mb-5">
            <Text className="font-display text-lg text-foreground">
              {t("order_details.status")}
            </Text>
            <Text className="font-body text-xs text-muted-foreground">
              {new Date(order.created_at).toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>

          {cancelled ? (
            <View className="flex-row items-center gap-2 bg-destructive/10 rounded-2xl px-4 py-3">
              <X size={16} color="#B91C1C" />
              <Text className="font-body-bold text-sm text-destructive">
                {t("order_details.cancelled")}
              </Text>
            </View>
          ) : (
            <View>
              {TIMELINE_STEPS.map((step, idx) => {
                const isLast = idx === TIMELINE_STEPS.length - 1;
                const isDone = idx < currentStep;
                const isCurrent = idx === currentStep;
                const StepIcon = step.icon;
                return (
                  <View key={step.status} className="flex-row items-start" style={{ paddingBottom: isLast ? 0 : 20 }}>
                    {!isLast && (
                      <View
                        style={{
                          position: "absolute",
                          left: 18,
                          top: 36,
                          width: 2,
                          bottom: -2,
                          backgroundColor: isDone ? brand.burgundy[600] : brand.border,
                        }}
                      />
                    )}
                    <View
                      className={`w-9 h-9 rounded-full items-center justify-center border-2 ${
                        isDone
                          ? "bg-primary border-primary"
                          : isCurrent
                            ? "border-transparent"
                            : "bg-muted border-border"
                      }`}
                      style={isCurrent ? shadows.button : undefined}
                    >
                      {isCurrent ? (
                        <View className="absolute inset-0 rounded-full overflow-hidden">
                          <Gradient
                            name="primary"
                            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
                          >
                            <StepIcon size={16} color="#FFFFFF" strokeWidth={2.4} />
                          </Gradient>
                        </View>
                      ) : (
                        <StepIcon
                          size={16}
                          color={isDone ? "#FFFFFF" : brand.textSecondary}
                          strokeWidth={2.4}
                        />
                      )}
                    </View>
                    <View className="flex-1 pt-1.5 ml-3">
                      <Text
                        className={`font-body-bold text-sm ${
                          isCurrent
                            ? "text-primary"
                            : isDone
                              ? "text-foreground"
                              : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Products */}
        {order.items && order.items.length > 0 && (
          <View
            className="bg-card rounded-3xl border border-border p-5 mb-4"
            style={shadows.card}
          >
            <Text className="font-display text-lg text-foreground mb-4">
              {t("order_details.products")}
            </Text>
            <View>
              {order.items.map((item, i) => {
                const isLast = i === order.items!.length - 1;
                const snap = item.product_snapshot;
                const img = item.product_image ?? snap?.images?.[0]?.url;
                return (
                  <View
                    key={item.id}
                    className={`flex-row items-center gap-3 py-3 ${isLast ? "" : "border-b border-border"}`}
                  >
                    {img ? (
                      <Image
                        source={{ uri: img }}
                        style={{ width: 48, height: 48, borderRadius: 12 }}
                      />
                    ) : (
                      <View
                        className="bg-muted items-center justify-center"
                        style={{ width: 48, height: 48, borderRadius: 12 }}
                      >
                        <Package size={18} color={brand.textSecondary} />
                      </View>
                    )}
                    <View className="flex-1 min-w-0">
                      <Text
                        className="font-body-bold text-sm text-foreground"
                        numberOfLines={1}
                      >
                        {item.product_name || snap?.name}
                      </Text>
                      <Text className="font-body text-xs text-muted-foreground mt-0.5">
                        {item.weight_label || snap?.variant_label} × {item.quantity}
                      </Text>
                    </View>
                    <Text className="font-display text-base text-foreground">
                      €{Number(item.line_total).toFixed(2)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Summary */}
        <View
          className="bg-card rounded-3xl border border-border p-5"
          style={shadows.card}
        >
          <Text className="font-display text-lg text-foreground mb-3">
            {t("order_details.summary")}
          </Text>
          <Row label={t("order_details.subtotal")} value={`€${Number(order.subtotal).toFixed(2)}`} />
          <Row
            label={t("order_details.delivery")}
            value={
              Number(order.delivery_fee) === 0
                ? t("cart.delivery_free")
                : `€${Number(order.delivery_fee).toFixed(2)}`
            }
            positive={Number(order.delivery_fee) === 0}
          />
          {Number(order.discount_amount) > 0 && (
            <Row
              label={t("order_details.discount")}
              value={`-€${Number(order.discount_amount).toFixed(2)}`}
              positive
            />
          )}
          <View className="border-t border-border pt-3 mt-3 flex-row items-center justify-between">
            <Text className="font-body-bold text-sm text-foreground">
              {t("order_details.total")}
            </Text>
            <Text className="font-display text-2xl text-primary">
              €{Number(order.total).toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom actions */}
      {(showCancel || showReorder) && (
        <View
          className="absolute bottom-0 left-0 right-0 px-4 py-4 bg-background/95 border-t border-border flex-row gap-3"
          style={shadows.sticky}
        >
          {showCancel && (
            <Pressable
              onPress={handleCancel}
              className="flex-1 h-12 rounded-2xl bg-destructive/10 items-center justify-center flex-row gap-2"
            >
              <X size={16} color="#B91C1C" strokeWidth={2.4} />
              <Text className="font-body-bold text-sm text-destructive">
                {t("order_details.cancel")}
              </Text>
            </Pressable>
          )}
          <Pressable
            onPress={handleReorder}
            className="flex-1 rounded-2xl overflow-hidden"
            style={shadows.button}
          >
            <Gradient
              name="primary"
              style={{
                height: 48,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <RotateCw size={16} color="#FFFFFF" strokeWidth={2.4} />
              <Text className="font-body-bold text-sm text-white">
                {t("order_details.reorder")}
              </Text>
            </Gradient>
          </Pressable>
        </View>
      )}
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
