import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Tag,
  X,
  ArrowRight,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { Gradient } from "@/components/ui";
import { brand, shadows } from "@/theme";

const DELIVERY_FEE = 3.99;
const FREE_DELIVERY_THRESHOLD = 40;

export default function CartScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { t } = useLang();
  const {
    items,
    itemCount,
    isLoading,
    updateItem,
    removeItem,
    applyPromo,
    appliedPromo,
    clearPromo,
  } = useCart();

  const subtotal = items.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0,
  );
  const [promoCode, setPromoCode] = useState("");
  const [applyingPromo, setApplyingPromo] = useState(false);

  const discount = appliedPromo?.free_delivery ? 0 : appliedPromo?.discount_amount || 0;
  const deliveryFee =
    subtotal >= FREE_DELIVERY_THRESHOLD || appliedPromo?.free_delivery
      ? 0
      : DELIVERY_FEE;
  const total = subtotal - discount + deliveryFee;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setApplyingPromo(true);
    const result = await applyPromo(promoCode.trim().toUpperCase());
    setApplyingPromo(false);
    if (result.success) {
      Alert.alert(t("cart.promo_apply"), t("cart.free_delivery"));
    } else {
      Alert.alert(t("common.error"), result.error || t("cart.promo_placeholder"));
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    router.push("/payment");
  };

  // ─── Empty state ──────────────────────────────────────────
  if (items.length === 0 && !isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top", "left", "right"]}>
        <StatusBar barStyle="dark-content" />
        <View className="px-5 pt-2 pb-4 flex-row items-center gap-2">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-2xl bg-card border border-border items-center justify-center"
            style={shadows.card}
          >
            <ArrowLeft size={18} color={brand.coal[900]} />
          </Pressable>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-3xl bg-muted items-center justify-center mb-4">
            <ShoppingBag size={32} color={brand.textSecondary} />
          </View>
          <Text className="font-display text-xl text-foreground mb-1">
            {t("cart.empty_title")}
          </Text>
          <Text className="font-body text-sm text-muted-foreground text-center mb-5">
            {t("cart.empty_subtitle")}
          </Text>
          <Pressable
            onPress={() => router.push("/(tabs)")}
            className="rounded-full overflow-hidden"
            style={shadows.button}
          >
            <Gradient
              name="primary"
              style={{
                paddingHorizontal: 20,
                paddingVertical: 12,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Text className="font-body-bold text-white text-sm">
                {t("cart.explore")}
              </Text>
              <ArrowRight size={16} color="#FFFFFF" />
            </Gradient>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Filled state ─────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="px-5 pt-2 pb-4">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-2xl bg-card border border-border items-center justify-center mb-3"
          style={shadows.card}
        >
          <ArrowLeft size={18} color={brand.coal[900]} />
        </Pressable>
        <Text className="font-body text-sm text-muted-foreground">
          {itemCount} {t("home.items")}
        </Text>
        <Text className="font-display text-3xl leading-9 text-foreground mt-0.5">
          {t("cart.title")}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 140, paddingHorizontal: 20, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Items */}
        {items.map((item) => (
          <View
            key={item.id}
            className="flex-row gap-3 p-3 bg-card rounded-3xl border border-border"
            style={shadows.card}
          >
            <Image
              source={{
                uri:
                  item.product_image ||
                  "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=200",
              }}
              style={{ width: 80, height: 80, borderRadius: 16 }}
              resizeMode="cover"
            />
            <View className="flex-1 min-w-0">
              <Text
                className="font-body-bold text-sm text-foreground"
                numberOfLines={2}
              >
                {item.product_name}
              </Text>
              {item.weight_label && (
                <Text className="font-body text-xs text-muted-foreground mt-0.5">
                  {item.weight_label}
                </Text>
              )}
              <View className="flex-row items-center justify-between mt-2">
                <Text className="font-display text-lg text-primary">
                  €{((item.price || 0) * item.quantity).toFixed(2)}
                </Text>
                <View className="flex-row items-center gap-1 bg-muted rounded-full p-1">
                  <Pressable
                    onPress={() => updateItem(item.id, Math.max(0, item.quantity - 1))}
                    className="w-7 h-7 rounded-full bg-card items-center justify-center"
                    style={shadows.card}
                  >
                    <Minus size={12} color={brand.coal[900]} />
                  </Pressable>
                  <Text className="font-body-bold text-sm w-6 text-center text-foreground">
                    {item.quantity}
                  </Text>
                  <Pressable
                    onPress={() => updateItem(item.id, item.quantity + 1)}
                    className="rounded-full overflow-hidden"
                  >
                    <Gradient
                      name="primary"
                      style={{
                        width: 28,
                        height: 28,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Plus size={12} color="#FFFFFF" strokeWidth={3} />
                    </Gradient>
                  </Pressable>
                </View>
              </View>
            </View>
            <Pressable
              onPress={() => removeItem(item.id)}
              className="self-start w-8 h-8 items-center justify-center"
              hitSlop={6}
            >
              <Trash2 size={16} color={brand.textSecondary} />
            </Pressable>
          </View>
        ))}

        {/* Promo input */}
        {!appliedPromo && (
          <View
            className="flex-row items-center bg-card rounded-2xl border border-border px-4 py-2"
            style={shadows.card}
          >
            <Tag size={16} color={brand.textSecondary} />
            <TextInput
              className="flex-1 ml-2 text-foreground"
              placeholder={t("cart.promo_placeholder")}
              placeholderTextColor={brand.textMuted}
              value={promoCode}
              onChangeText={setPromoCode}
              autoCapitalize="characters"
              style={{ fontFamily: "Inter_400Regular", fontSize: 14 }}
            />
            <Pressable
              onPress={handleApplyPromo}
              disabled={applyingPromo}
              className="rounded-lg overflow-hidden"
            >
              <Gradient
                name="primary"
                style={{ paddingHorizontal: 14, paddingVertical: 8 }}
              >
                {applyingPromo ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text className="font-body-bold text-xs text-white">
                    {t("cart.promo_apply")}
                  </Text>
                )}
              </Gradient>
            </Pressable>
          </View>
        )}

        {appliedPromo && (
          <View className="flex-row items-center bg-gold/15 rounded-2xl border border-gold/30 px-4 py-3">
            <Tag size={14} color={brand.gold[600]} />
            <Text className="flex-1 ml-2 font-body-semibold text-xs text-gold-deep">
              "{appliedPromo.code}" —{" "}
              {appliedPromo.free_delivery
                ? t("cart.free_delivery")
                : `-€${appliedPromo.discount_amount.toFixed(2)}`}
            </Text>
            <Pressable onPress={clearPromo} hitSlop={6}>
              <X size={14} color={brand.gold[600]} />
            </Pressable>
          </View>
        )}

        {/* Summary */}
        <View
          className="bg-card rounded-3xl border border-border p-5 mt-1"
          style={shadows.card}
        >
          <Row label={t("cart.subtotal")} value={`€${subtotal.toFixed(2)}`} />
          {discount > 0 && (
            <Row
              label={t("cart.discount")}
              value={`-€${discount.toFixed(2)}`}
              positive
            />
          )}
          <Row
            label={t("cart.delivery")}
            value={deliveryFee === 0 ? t("cart.delivery_free") : `€${deliveryFee.toFixed(2)}`}
            positive={deliveryFee === 0}
          />
          {subtotal < FREE_DELIVERY_THRESHOLD && !appliedPromo?.free_delivery && (
            <Text className="font-body-semibold text-xs text-gold-deep mt-1">
              {t("cart.delivery_free_from")} €{FREE_DELIVERY_THRESHOLD} 🎉
            </Text>
          )}
          <View className="border-t border-border pt-3 mt-3">
            <View className="flex-row items-center justify-between">
              <Text className="font-body-bold text-sm text-foreground">
                {t("cart.total")}
              </Text>
              <Text className="font-display text-xl text-primary">
                €{total.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky checkout */}
      <View
        className="absolute bottom-0 left-0 right-0 px-4 py-4 bg-background/95 border-t border-border"
        style={shadows.sticky}
      >
        <Pressable
          onPress={handleCheckout}
          className="rounded-2xl overflow-hidden"
          style={shadows.button}
        >
          <Gradient
            name="primary"
            style={{
              height: 56,
              paddingHorizontal: 20,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text className="font-body-bold text-base text-white">
              {t("cart.checkout")} · €{total.toFixed(2)}
            </Text>
            <ArrowRight size={20} color="#FFFFFF" />
          </Gradient>
        </Pressable>
      </View>
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
