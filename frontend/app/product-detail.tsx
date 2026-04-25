import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
  Share,
  Platform,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
  Clock,
  Share2,
  Package,
  Leaf,
} from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { api } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { useLang } from "@/contexts/LanguageContext";
import type { Product, ProductVariant, PackItem } from "@/lib/types";
import { getProductImage } from "@/lib/types";
import {
  Button,
  Card,
  HalalBadge,
  PriceTag,
  SectionHeader,
} from "@/components/ui";
import { brand, shadows } from "@/theme";

function getPackItemImage(item: PackItem): string {
  const img = item.product_images?.[0];
  if (typeof img === "string") return img;
  if (img?.url) return img.url;
  return "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400";
}

export default function ProductDetailScreen() {
  const router = useRouter();
  const { t } = useLang();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addItem, itemCount } = useCart();
  const { width } = useWindowDimensions();
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    (async () => {
      const [productRes, variantRes] = await Promise.all([
        api.get<Product>(`/products/${id}`, false),
        api.get<ProductVariant[]>(`/products/${id}/variants`, false),
      ]);
      if (productRes.success && productRes.data) setProduct(productRes.data);
      if (variantRes.success && variantRes.data) {
        const active = variantRes.data.filter((v) => v.is_active && v.stock_qty > 0);
        setVariants(active);
        if (active.length > 0) setSelectedVariant(active[0]);
      }
      setIsLoading(false);
    })();
  }, [id]);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    setAddingToCart(true);
    const result = await addItem(selectedVariant.id, quantity, {
      product_name: product?.name,
      product_image: product?.images?.[0]?.url,
      weight_label: selectedVariant.label,
      price: selectedVariant.price,
    });
    setAddingToCart(false);
    if (result.success) {
      Alert.alert(t("product.added"), `${product?.name} ${t("product.added_to_cart")}`);
    } else {
      Alert.alert(t("common.error"), result.error || t("product.could_not_add"));
    }
  };

  const handleShare = async () => {
    if (!product) return;
    const price = selectedVariant
      ? `€${Number(selectedVariant.price).toFixed(2)}`
      : `€${Number(product.price_per_kg).toFixed(2)}`;
    const items =
      product.pack_items
        ?.map(
          (i) =>
            `  • ${i.custom_label || i.product_name}${i.quantity > 1 ? ` x${i.quantity}` : ""}`,
        )
        .join("\n") || "";
    const message = `${product.name}\n${product.short_desc || ""}\n\n${items ? `${t("product.pack_contents")}:\n${items}\n\n` : ""}${price}\n\nAzafarán`;
    try {
      await Share.share({ message });
    } catch {
      // ignore
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={brand.burgundy[600]} />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
        <Text className="font-body text-muted-foreground text-lg mb-4">
          {t("product.not_found")}
        </Text>
        <Button label={t("product.back")} onPress={() => router.back()} fullWidth={false} />
      </SafeAreaView>
    );
  }

  const isPack = product.unit_type === "pack" && product.pack_items && product.pack_items.length > 0;
  const price = selectedVariant ? Number(selectedVariant.price) : 0;
  const comparePrice = selectedVariant?.compare_at_price ? Number(selectedVariant.compare_at_price) : null;
  const total = price * quantity;

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* Full-bleed hero image with gradient fade */}
        <View style={{ width, height: width * 1.05 }} className="relative bg-coal">
          <Image
            source={{ uri: getProductImage(product) }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <LinearGradient
            colors={["rgba(26,15,15,0.45)", "rgba(26,15,15,0)", "rgba(250,246,241,1)"]}
            locations={[0, 0.35, 1]}
            style={StyleSheet.absoluteFill}
          />

          {/* Floating back + cart with glassmorphism */}
          <SafeAreaView
            edges={["top"]}
            style={{ position: "absolute", left: 0, right: 0, top: 0 }}
          >
            <View className="flex-row justify-between items-center px-5 pt-2">
              <GlassIconButton onPress={() => router.back()}>
                <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2.4} />
              </GlassIconButton>

              <View className="flex-row gap-2">
                {isPack && (
                  <GlassIconButton onPress={handleShare}>
                    <Share2 size={18} color="#FFFFFF" strokeWidth={2.4} />
                  </GlassIconButton>
                )}
                <GlassIconButton onPress={() => router.push("/cart")}>
                  <ShoppingCart size={18} color="#FFFFFF" strokeWidth={2.4} />
                  {itemCount > 0 && (
                    <View
                      className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-gold items-center justify-center px-1"
                    >
                      <Text className="text-coal text-[10px] font-body-bold">{itemCount}</Text>
                    </View>
                  )}
                </GlassIconButton>
              </View>
            </View>
          </SafeAreaView>
        </View>

        {/* Content slab lifted over gradient fade */}
        <View className="px-5 -mt-6">
          {/* Title + halal + price */}
          <View className="flex-row items-start gap-3 mb-3">
            <View className="flex-1">
              {product.category_name && (
                <Text className="font-body-semibold text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5">
                  {product.category_name}
                </Text>
              )}
              <Text className="font-display text-[30px] leading-9 text-foreground">
                {product.name}
              </Text>
              {product.short_desc && (
                <Text className="font-body text-[14px] leading-6 text-muted-foreground mt-1.5">
                  {product.short_desc}
                </Text>
              )}
            </View>
          </View>

          {product.halal_cert_id && (
            <View className="mb-5 flex-row">
              <HalalBadge label={t("product.halal_certified")} />
            </View>
          )}

          <View className="mb-6">
            <PriceTag amount={price} compareAt={comparePrice ?? undefined} size="xl" />
          </View>

          {/* Variant selector */}
          {variants.length > 1 && (
            <View className="mb-6">
              <Text className="font-body-semibold text-[11px] uppercase tracking-widest text-muted-foreground mb-3">
                {isPack ? t("product.pack_size") : t("product.weight_format")}
              </Text>
              <View className="flex-row bg-muted rounded-2xl p-1">
                {variants.map((v) => {
                  const active = selectedVariant?.id === v.id;
                  return (
                    <Pressable
                      key={v.id}
                      onPress={() => {
                        setSelectedVariant(v);
                        setQuantity(1);
                      }}
                      className={`flex-1 items-center justify-center py-3 rounded-xl ${active ? "bg-card" : ""}`}
                      style={active ? shadows.card : undefined}
                    >
                      <Text
                        className={`font-body-semibold text-sm ${active ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {v.label}
                      </Text>
                      <Text
                        className={`font-display-semibold text-base mt-0.5 ${active ? "text-primary" : "text-muted-foreground"}`}
                      >
                        €{Number(v.price).toFixed(2)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* Quantity */}
          <Card className="p-4 mb-6 flex-row items-center justify-between">
            <Text className="font-body-semibold text-[15px] text-foreground">
              {t("product.quantity")}
            </Text>
            <View className="flex-row items-center gap-4">
              <Pressable
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-11 h-11 rounded-full bg-muted items-center justify-center"
                hitSlop={8}
              >
                <Minus size={18} color={brand.coal[900]} strokeWidth={2.4} />
              </Pressable>
              <Text className="font-display-semibold text-xl text-foreground w-8 text-center">
                {quantity}
              </Text>
              <Pressable
                onPress={() => setQuantity(Math.min(selectedVariant?.stock_qty || 99, quantity + 1))}
                className="w-11 h-11 rounded-full bg-primary items-center justify-center"
                style={shadows.button}
                hitSlop={8}
              >
                <Plus size={18} color="#FFFFFF" strokeWidth={2.6} />
              </Pressable>
            </View>
          </Card>

          {/* Pack contents */}
          {isPack && product.pack_items && (
            <View className="mb-7">
              <SectionHeader
                title={t("product.pack_contents")}
                accent="gold"
                className="mb-4"
              />
              <Card>
                {product.pack_items.map((item, i) => (
                  <View
                    key={item.id}
                    className={`flex-row items-center p-4 ${i < product.pack_items!.length - 1 ? "border-b border-border" : ""}`}
                  >
                    <Image
                      source={{ uri: getPackItemImage(item) }}
                      className="w-12 h-12 rounded-xl"
                      resizeMode="cover"
                    />
                    <View className="flex-1 ml-3">
                      <Text
                        className="font-body-semibold text-[14px] text-foreground"
                        numberOfLines={1}
                      >
                        {item.custom_label || item.product_name}
                      </Text>
                      {item.product_category_name && (
                        <Text className="font-body text-xs text-muted-foreground mt-0.5">
                          {item.product_category_name}
                        </Text>
                      )}
                    </View>
                    {item.quantity > 1 && (
                      <View className="bg-primary-tint px-3 py-1 rounded-full">
                        <Text className="font-body-bold text-xs text-primary">
                          ×{item.quantity}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </Card>
            </View>
          )}

          {/* Description */}
          {product.description && (
            <View className="mb-7">
              <SectionHeader title={t("product.description")} className="mb-4" />
              <Text className="font-body text-[15px] leading-7 text-foreground/90">
                {product.description}
              </Text>
            </View>
          )}

          {/* Feature cards */}
          <View className="flex-row gap-3">
            <FeatureCard icon={<Clock size={18} color={brand.burgundy[600]} />} label={t("product.fast_delivery")} />
            <FeatureCard icon={<Leaf size={18} color={brand.burgundy[600]} />} label={t("product.natural")} />
            {product.halal_cert_id && (
              <FeatureCard
                icon={<Package size={18} color={brand.gold[600]} />}
                label={t("product.halal_certified")}
                tone="gold"
              />
            )}
          </View>
        </View>
      </ScrollView>

      {/* Sticky bottom CTA */}
      <SafeAreaView edges={["bottom"]} style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
        <View
          className="bg-card px-5 pt-4 pb-4 flex-row items-center gap-4 border-t border-border"
          style={shadows.sticky}
        >
          <View>
            <Text className="font-body-semibold text-[11px] uppercase tracking-widest text-muted-foreground">
              Total
            </Text>
            <PriceTag amount={total} size="lg" />
          </View>
          <View className="flex-1">
            <Button
              label={t("product.add_to_cart")}
              onPress={handleAddToCart}
              loading={addingToCart}
              disabled={!selectedVariant}
              leftIcon={<ShoppingCart size={18} color="#FFFFFF" strokeWidth={2.4} />}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function GlassIconButton({
  onPress,
  children,
}: {
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="w-11 h-11 rounded-full overflow-hidden items-center justify-center"
      hitSlop={6}
    >
      {Platform.OS === "web" ? (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: "rgba(26,15,15,0.45)",
              backdropFilter: "blur(12px)" as unknown as string,
            },
          ]}
        />
      ) : (
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      )}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: "rgba(26,15,15,0.25)",
            borderRadius: 999,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.18)",
          },
        ]}
      />
      <View className="items-center justify-center">{children}</View>
    </Pressable>
  );
}

function FeatureCard({
  icon,
  label,
  tone = "burgundy",
}: {
  icon: React.ReactNode;
  label: string;
  tone?: "burgundy" | "gold";
}) {
  const bg = tone === "gold" ? "bg-gold/10" : "bg-primary-tint";
  return (
    <View className={`flex-1 rounded-2xl p-3.5 items-center ${bg}`}>
      <View className="mb-2">{icon}</View>
      <Text
        className="font-body-semibold text-[11px] text-foreground text-center leading-4"
        numberOfLines={2}
      >
        {label}
      </Text>
    </View>
  );
}
