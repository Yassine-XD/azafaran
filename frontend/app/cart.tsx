import { useState } from "react";
import { ScrollView, View, Pressable, TextInput, Alert } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { ArrowLeft, Minus, Plus, X, Tag } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Motion } from "@legendapp/motion";

import { Display, Heading2, Heading3, Body, Small, Caption } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);

export default function CartScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { t } = useLang();
  const {
    items,
    subtotal,
    isLoading,
    updateItem,
    removeItem,
    applyPromo,
    clearPromo,
    appliedPromo,
  } = useCart();

  const [promoCode, setPromoCode] = useState("");
  const [applyingPromo, setApplyingPromo] = useState(false);

  const onApplyPromo = async () => {
    if (!promoCode.trim()) return;
    if (!isAuthenticated) {
      Alert.alert(t("rebuild.cart.promo_login_cta"), t("rebuild.cart.promo_login_required"), [
        { text: t("common.cancel"), style: "cancel" },
        { text: t("rebuild.cart.promo_login_cta"), onPress: () => router.push("/login") },
      ]);
      return;
    }
    setApplyingPromo(true);
    const r = await applyPromo(promoCode.trim());
    setApplyingPromo(false);
    if (r.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setPromoCode("");
    } else {
      Alert.alert("Código no válido", r.error || "Inténtalo de nuevo");
    }
  };

  const onCheckout = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    router.push("/checkout");
  };

  const total = subtotal - (appliedPromo?.discount_amount ?? 0);

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="px-5 py-3 flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-muted"
        >
          <ArrowLeft size={20} color="#0B0B0C" strokeWidth={2} />
        </Pressable>
        <Heading2>{t("rebuild.cart.title")}</Heading2>
        <View className="w-10" />
      </View>

      {items.length === 0 && !isLoading ? (
        <View className="flex-1 items-center justify-center px-8">
          <Display className="text-center">{t("rebuild.cart.empty_title")}</Display>
          <Body className="mt-3 text-center text-muted-foreground">
            {t("rebuild.cart.empty_subtitle")}
          </Body>
          <Button
            title={t("rebuild.cart.empty_cta")}
            variant="primary"
            size="lg"
            className="mt-8"
            onPress={() => router.push("/(tabs)" as any)}
          />
        </View>
      ) : (
        <>
          <ScrollView contentContainerClassName="px-5 pb-32">
            {/* Promo banner — informational */}
            {appliedPromo ? (
              <Motion.View
                className="mb-4 p-4 rounded-2xl bg-halal/10 border border-halal/30 flex-row items-center justify-between"
                initial={{ opacity: 0, translateY: -8 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "spring", damping: 18, stiffness: 220 }}
              >
                <View className="flex-1 flex-row items-center gap-2">
                  <Tag size={16} color="#0F7A4A" strokeWidth={2} />
                  <View className="flex-1">
                    <Caption className="uppercase tracking-wide text-halal font-body-semibold">
                      {appliedPromo.code}
                    </Caption>
                    <Small className="text-foreground">
                      {t("rebuild.cart.discount")}: {fmt(appliedPromo.discount_amount)}
                    </Small>
                  </View>
                </View>
                <Pressable onPress={clearPromo} className="ml-2 p-1.5 rounded-full bg-card">
                  <X size={14} color="#0B0B0C" strokeWidth={2} />
                </Pressable>
              </Motion.View>
            ) : null}

            {/* Items */}
            <View className="gap-3">
              {items.map((item) => (
                <View
                  key={item.id}
                  className="flex-row p-3 rounded-2xl bg-card border border-border"
                >
                  <View className="w-20 h-20 rounded-xl overflow-hidden bg-muted">
                    {item.product_image ? (
                      <Image
                        source={{ uri: item.product_image }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                        transition={150}
                      />
                    ) : null}
                  </View>
                  <View className="flex-1 ml-3 justify-between">
                    <View>
                      <Body numberOfLines={2} className="font-body-semibold">
                        {item.product_name}
                      </Body>
                      <Small className="text-muted-foreground">
                        {item.weight_label}
                      </Small>
                    </View>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center bg-muted rounded-pill">
                        <Pressable
                          onPress={() =>
                            item.quantity <= 1
                              ? removeItem(item.id)
                              : updateItem(item.id, item.quantity - 1)
                          }
                          className="w-8 h-8 items-center justify-center"
                        >
                          <Minus size={14} color="#0B0B0C" strokeWidth={2} />
                        </Pressable>
                        <Body className="font-body-semibold mx-2 min-w-[20px] text-center">
                          {item.quantity}
                        </Body>
                        <Pressable
                          onPress={() => updateItem(item.id, item.quantity + 1)}
                          className="w-8 h-8 items-center justify-center"
                        >
                          <Plus size={14} color="#0B0B0C" strokeWidth={2} />
                        </Pressable>
                      </View>
                      <Body className="font-mono-semibold">
                        {fmt((item.price ?? 0) * item.quantity)}
                      </Body>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Promo input */}
            {!appliedPromo ? (
              <View className="mt-6">
                <Heading3>{t("rebuild.cart.promo_label")}</Heading3>
                <View className="mt-3 flex-row gap-2">
                  <View className="flex-1 px-4 h-12 rounded-xl bg-card border border-border justify-center">
                    <TextInput
                      placeholder={t("rebuild.cart.promo_placeholder")}
                      autoCapitalize="characters"
                      value={promoCode}
                      onChangeText={setPromoCode}
                      style={{ fontFamily: "Inter_500Medium", fontSize: 15 }}
                      placeholderTextColor="#A1A1A6"
                    />
                  </View>
                  <Button
                    title={t("common.apply")}
                    variant="secondary"
                    size="md"
                    loading={applyingPromo}
                    disabled={!promoCode.trim()}
                    onPress={onApplyPromo}
                  />
                </View>
              </View>
            ) : null}

            {/* Totals */}
            <View className="mt-6 p-4 rounded-2xl bg-surface border border-border">
              <View className="flex-row justify-between">
                <Body className="text-muted-foreground">{t("rebuild.cart.subtotal")}</Body>
                <Body className="font-mono-medium">{fmt(subtotal)}</Body>
              </View>
              {appliedPromo ? (
                <View className="mt-2 flex-row justify-between">
                  <Body className="text-halal">{t("rebuild.cart.discount")}</Body>
                  <Body className="font-mono-medium text-halal">
                    −{fmt(appliedPromo.discount_amount)}
                  </Body>
                </View>
              ) : null}
              <View className="mt-3 pt-3 border-t border-border flex-row justify-between items-baseline">
                <Heading3>{t("rebuild.cart.total")}</Heading3>
                <Body className="font-mono-semibold text-h2">{fmt(total)}</Body>
              </View>
            </View>
          </ScrollView>

          {/* Sticky checkout */}
          <View className="absolute bottom-0 left-0 right-0 px-5 pt-3 pb-6 bg-background border-t border-border shadow-sticky">
            <Button
              title={`${t("rebuild.cart.checkout_cta")} · ${fmt(total)}`}
              variant="primary"
              size="lg"
              fullWidth
              onPress={onCheckout}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
