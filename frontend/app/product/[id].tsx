import { useEffect, useMemo, useState } from "react";
import { ScrollView, View, Pressable, Alert } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { ArrowLeft, ShoppingBag } from "lucide-react-native";
import * as Haptics from "expo-haptics";

import { Display, Heading2, Heading3, Body, Small, Caption } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PriceBlock, pricePerKg } from "@/components/product/PriceBlock";
import { VariantPicker } from "@/components/product/VariantPicker";
import { useProduct, type Variant } from "@/hooks/queries";
import { useCart } from "@/contexts/CartContext";
import { useLang } from "@/contexts/LanguageContext";
import { allImages } from "@/lib/productImage";

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: product, isLoading } = useProduct(id);
  const { addItem } = useCart();
  const { t } = useLang();

  const [variantId, setVariantId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  // Default to the first active variant on load.
  useEffect(() => {
    if (product?.variants?.length && !variantId) {
      const first = product.variants.find((v) => v.is_active) ?? product.variants[0];
      setVariantId(first?.id ?? null);
    }
  }, [product, variantId]);

  const variant = useMemo<Variant | null>(() => {
    if (!product?.variants || !variantId) return null;
    return product.variants.find((v) => v.id === variantId) ?? null;
  }, [product, variantId]);

  const images = product ? allImages(product.images) : [];
  const showHalal = !!product?.halal_cert_id;
  const showLowStock =
    variant && variant.low_stock_threshold != null && variant.stock_qty <= variant.low_stock_threshold;
  const outOfStock = variant ? variant.stock_qty <= 0 : false;

  const onAdd = async () => {
    if (!variant || !product) return;
    setAdding(true);
    try {
      const r = await addItem(variant.id, 1, {
        product_name: product.name,
        product_image: images[0],
        weight_label: variant.label,
        price: variant.price,
      });
      if (r.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        router.push("/cart");
      } else {
        Alert.alert(t("rebuild.product.add_failed_title"), r.error || t("rebuild.product.add_failed_retry"));
      }
    } finally {
      setAdding(false);
    }
  };

  if (isLoading || !product) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-background">
        <Stack.Screen options={{ headerShown: false }} />
        <View className="px-5">
          <Skeleton className="aspect-square rounded-2xl mt-2" />
          <Skeleton className="h-8 w-3/4 mt-6" />
          <Skeleton className="h-12 w-1/2 mt-4" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={["top"]} className="flex-1">
        <ScrollView contentContainerClassName="pb-32">
          {/* Image hero */}
          <View className="relative">
            <View className="aspect-square w-full bg-muted">
              {images[0] ? (
                <Image
                  source={{ uri: images[0] }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                  transition={200}
                />
              ) : null}
            </View>
            <Pressable
              onPress={() => router.back()}
              className="absolute top-3 left-3 w-10 h-10 items-center justify-center rounded-full bg-background/90"
            >
              <ArrowLeft size={20} color="#0B0B0C" strokeWidth={2} />
            </Pressable>
            {showHalal ? (
              <View className="absolute top-3 right-3">
                <Badge variant="halal" label="Halal" />
              </View>
            ) : null}
          </View>

          {/* Content */}
          <View className="px-5 pt-5">
            {product.category_name ? (
              <Caption className="uppercase tracking-wide text-muted-foreground">
                {product.category_name}
              </Caption>
            ) : null}
            <Display className="mt-1">{product.name}</Display>
            {product.short_desc ? (
              <Body className="mt-2 text-muted-foreground">{product.short_desc}</Body>
            ) : null}

            {/* PriceBlock — the centerpiece */}
            {variant ? (
              <View className="mt-5">
                <PriceBlock
                  amount={variant.price}
                  unitLabel={product.unit_label_override || variant.label}
                  perKg={pricePerKg(variant.price, variant.weight_grams)}
                  compareAt={variant.compare_at_price}
                  size="lg"
                />
                <View className="flex-row items-center gap-2 mt-2 flex-wrap">
                  {variant.badge_label ? (
                    <Badge variant="promo" label={variant.badge_label} />
                  ) : null}
                  {showLowStock ? (
                    <Caption className="text-sale font-body-semibold">
                      {t("rebuild.product.stock_left")} {variant.stock_qty}
                    </Caption>
                  ) : null}
                </View>
              </View>
            ) : null}

            {/* Variants */}
            {product.variants && product.variants.length > 1 ? (
              <View className="mt-6">
                <Heading3>{t("rebuild.product.size")}</Heading3>
                <View className="mt-3">
                  <VariantPicker
                    variants={product.variants as any}
                    selectedId={variantId}
                    onSelect={setVariantId}
                  />
                </View>
              </View>
            ) : null}

            {/* Description */}
            {product.description ? (
              <View className="mt-8">
                <Heading2>{t("rebuild.product.description")}</Heading2>
                <Body className="mt-2 leading-6">{product.description}</Body>
              </View>
            ) : null}

            {/* Halal block */}
            {showHalal ? (
              <View className="mt-8 p-4 rounded-2xl bg-surface border border-border">
                <View className="flex-row items-center gap-2 mb-1">
                  <View className="w-2 h-2 rounded-full bg-halal" />
                  <Caption className="uppercase tracking-wide text-foreground font-body-semibold">
                    {t("rebuild.product.halal_title")}
                  </Caption>
                </View>
                <Body>
                  {product.halal_cert_body || "CICEM"} · {product.halal_cert_id}
                </Body>
                <Small className="mt-1 text-muted-foreground">
                  {t("rebuild.product.halal_note")}
                </Small>
              </View>
            ) : null}

            {/* Pack contents */}
            {product.pack_items && product.pack_items.length > 0 ? (
              <View className="mt-8">
                <Heading2>{t("rebuild.product.pack_contents")}</Heading2>
                <View className="mt-3 gap-2">
                  {product.pack_items.map((item: any) => (
                    <View key={item.id} className="flex-row justify-between p-3 rounded-xl bg-surface border border-border">
                      <Body>{item.product_name}</Body>
                      <Body className="font-body-semibold">×{item.quantity}</Body>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        </ScrollView>

        {/* Sticky add-to-cart bar */}
        <View
          className="absolute bottom-0 left-0 right-0 px-5 pt-3 pb-6 bg-background border-t border-border shadow-sticky"
        >
          <Button
            title={
              outOfStock
                ? t("rebuild.product.out_of_stock")
                : adding
                ? t("rebuild.product.adding")
                : t("rebuild.product.add_to_cart")
            }
            variant="primary"
            size="lg"
            fullWidth
            disabled={!variant || outOfStock}
            loading={adding}
            leftIcon={<ShoppingBag size={18} color="#FFFFFF" strokeWidth={2} />}
            onPress={onAdd}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
