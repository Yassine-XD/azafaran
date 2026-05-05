import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  Image,
  ImageBackground,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Flame,
  Zap,
  Tag,
  Star,
  Clock,
  X,
  Plus,
  Minus,
} from "lucide-react-native";
import { api } from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/lib/types";
import { getProductImage, getMinPrice } from "@/lib/types";
import { buildDualPriceProps } from "@/lib/pricing";
import { BottomSheet, Gradient, MobileTopBar, PriceTag } from "@/components/ui";
import { brand, shadows } from "@/theme";

type DiscountedProduct = Product & { off: number };
type Tab = "flash" | "boxes";

export default function DealsScreen() {
  const { t, lang } = useLang();
  const { addItem } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<Tab>("flash");
  const [selected, setSelected] = useState<{ kind: "product" | "box"; data: Product } | null>(null);

  const fetchData = useCallback(async () => {
    const res = await api.get<Product[]>("/products/", false);
    if (res.success && res.data) setProducts(res.data);
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const discounted = useMemo<DiscountedProduct[]>(() => {
    return products
      .map((p) => {
        const v = p.variants?.[0];
        if (!v?.compare_at_price || v.compare_at_price <= v.price) return null;
        return { ...p, off: Math.round(((v.compare_at_price - v.price) / v.compare_at_price) * 100) };
      })
      .filter((x): x is DiscountedProduct => x !== null)
      .sort((a, b) => b.off - a.off);
  }, [products]);

  const boxes = useMemo<Product[]>(
    () =>
      products.filter(
        (p) =>
          (p.pack_items && p.pack_items.length > 0) ||
          p.category_slug === "bbq-packs" ||
          p.category_slug === "packs",
      ),
    [products],
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={brand.burgundy[600]} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" />

      <MobileTopBar showGreeting={false} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={brand.burgundy[600]}
          />
        }
      >
        {/* Header */}
        <View className="pt-2 pb-5">
          <View className="flex-row items-center gap-2">
            <Flame size={18} color={brand.burgundy[600]} strokeWidth={2.4} />
            <Text className="font-body-semibold text-sm text-primary">
              {t("deals_tab.eyebrow")}
            </Text>
          </View>
          <Text className="font-display text-3xl leading-9 text-foreground mt-1">
            {t("deals_tab.title")}
          </Text>
        </View>

        {/* Segmented tabs */}
        <View className="bg-muted/60 p-1 rounded-2xl flex-row mb-5">
          <TabButton
            label={t("deals_tab.tab_flash")}
            icon={Zap}
            active={tab === "flash"}
            onPress={() => setTab("flash")}
          />
          <TabButton
            label={t("deals_tab.tab_boxes")}
            icon={Tag}
            active={tab === "boxes"}
            onPress={() => setTab("boxes")}
          />
        </View>

        {tab === "flash" && (
          <FlashList
            items={discounted}
            emptyLabel={t("deals_tab.empty_flash")}
            morePicksLabel={t("deals_tab.more_picks")}
            topDealLabel={t("deals_tab.top_deal")}
            onPick={(p) => setSelected({ kind: "product", data: p })}
            t={t}
          />
        )}

        {tab === "boxes" && (
          <BoxList
            items={boxes}
            emptyLabel={t("deals_tab.empty_boxes")}
            endsInLabel={t("deals_tab.ends_in")}
            onPick={(p) => setSelected({ kind: "box", data: p })}
          />
        )}
      </ScrollView>

      {/* Detail bottom sheet (custom reanimated slide-up) */}
      <BottomSheet visible={!!selected} onClose={() => setSelected(null)}>
        {selected?.kind === "product" && (
          <ProductSheet
            product={selected.data}
            onClose={() => setSelected(null)}
            onAdd={async (qty) => {
              const v = selected.data.variants?.[0];
              if (v) {
                await addItem(v.id, qty, {
                  product_name: selected.data.name,
                  product_image: getProductImage(selected.data),
                  weight_label: v.label,
                  price: v.price,
                });
              }
              setSelected(null);
            }}
            addLabel={t("deals_tab.add_to_cart")}
            qtyLabel={t("deals_tab.quantity")}
            dualPriceProps={buildDualPriceProps(selected.data, t)}
          />
        )}
        {selected?.kind === "box" && (
          <BoxSheet
            product={selected.data}
            onClose={() => setSelected(null)}
            onAdd={async () => {
              const v = selected.data.variants?.[0];
              if (v) {
                await addItem(v.id, 1, {
                  product_name: selected.data.name,
                  product_image: getProductImage(selected.data),
                  weight_label: v.label,
                  price: v.price,
                });
              }
              setSelected(null);
            }}
            addLabel={t("deals_tab.add_box")}
            insideLabel={t("deals_tab.inside")}
            endsInLabel={t("deals_tab.ends_in")}
            saveLabel={t("deals_tab.save")}
          />
        )}
      </BottomSheet>
    </SafeAreaView>
  );
}

function TabButton({
  label,
  icon: Icon,
  active,
  onPress,
}: {
  label: string;
  icon: typeof Zap;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 h-10 rounded-xl flex-row items-center justify-center gap-1.5 ${
        active ? "bg-card" : ""
      }`}
      style={active ? shadows.card : undefined}
    >
      <Icon size={16} color={active ? brand.coal[900] : brand.textSecondary} strokeWidth={2.2} />
      <Text
        className={`font-body-bold text-xs ${active ? "text-foreground" : "text-muted-foreground"}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// ─── Flash list ─────────────────────────────────────────────────
function FlashList({
  items,
  emptyLabel,
  morePicksLabel,
  topDealLabel,
  onPick,
  t,
}: {
  items: DiscountedProduct[];
  emptyLabel: string;
  morePicksLabel: string;
  topDealLabel: string;
  onPick: (p: DiscountedProduct) => void;
  t: (k: string) => string;
}) {
  if (!items.length) {
    return (
      <View className="items-center justify-center py-20">
        <View className="w-16 h-16 rounded-full bg-primary-tint items-center justify-center mb-3">
          <Zap size={26} color={brand.burgundy[600]} />
        </View>
        <Text className="font-body text-muted-foreground">{emptyLabel}</Text>
      </View>
    );
  }

  const [top, ...rest] = items;
  const v = top.variants?.[0];
  const topImage = getProductImage(top);

  return (
    <View>
      {/* Top deal hero */}
      <Pressable
        onPress={() => onPick(top)}
        className="rounded-3xl overflow-hidden mb-4"
        style={shadows.cardLift}
      >
        <ImageBackground
          source={topImage ? { uri: topImage } : undefined}
          style={{ minHeight: 180, backgroundColor: "#1A0F0F" }}
        >
          <Gradient name="overlay" style={{ flex: 1 }}>
            <View className="flex-1 p-5 justify-between">
              <View className="flex-row items-center gap-2">
                <View className="bg-gold px-2 py-1 rounded-full">
                  <Text className="text-coal text-[10px] font-body-bold uppercase">
                    {topDealLabel}
                  </Text>
                </View>
                <View className="bg-primary px-2 py-1 rounded-full">
                  <Text className="text-white text-[10px] font-body-bold uppercase">
                    -{top.off}%
                  </Text>
                </View>
              </View>
              <View className="mt-6">
                <Text className="font-display text-white text-2xl leading-7" numberOfLines={2}>
                  {top.name}
                </Text>
                <View className="flex-row items-baseline gap-2 mt-1">
                  <Text className="font-display text-white text-3xl">
                    €{Number(getMinPrice(top)).toFixed(2)}
                  </Text>
                  {v?.compare_at_price && (
                    <Text className="font-body text-white/70 text-sm line-through">
                      €{Number(v.compare_at_price).toFixed(2)}
                    </Text>
                  )}
                  {v?.label && (
                    <Text className="font-body text-white/70 text-xs">/ {v.label}</Text>
                  )}
                </View>
              </View>
            </View>
          </Gradient>
        </ImageBackground>
      </Pressable>

      <Text className="font-body-bold text-[11px] uppercase tracking-widest text-muted-foreground mt-2 mb-3">
        {morePicksLabel}
      </Text>

      {/* 2-col grid */}
      <View className="flex-row flex-wrap" style={{ gap: 12 }}>
        {rest.map((p) => (
          <View key={p.id} style={{ width: "47.8%" }}>
            <FlashCard product={p} onPress={() => onPick(p)} t={t} />
          </View>
        ))}
      </View>
    </View>
  );
}

function FlashCard({
  product,
  onPress,
  t,
}: {
  product: DiscountedProduct;
  onPress: () => void;
  t: (k: string) => string;
}) {
  const img = getProductImage(product);
  const dual = buildDualPriceProps(product, t);
  return (
    <Pressable
      onPress={onPress}
      className="bg-card rounded-2xl overflow-hidden border border-border"
      style={shadows.card}
    >
      <View className="aspect-square relative bg-muted">
        {img ? (
          <Image
            source={{ uri: img }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        ) : null}
        <View className="absolute top-2 left-2 bg-primary px-2 py-0.5 rounded-full">
          <Text className="text-white text-[10px] font-body-bold">-{product.off}%</Text>
        </View>
      </View>
      <View className="p-3">
        <Text className="font-body-bold text-sm text-foreground" numberOfLines={1}>
          {product.name}
        </Text>
        <View className="flex-row items-center gap-1 mt-0.5 mb-2">
          <Star size={11} fill="#C9A961" color="#C9A961" />
          <Text className="font-body text-[11px] text-muted-foreground">
            {Number(product.avg_rating ?? 0).toFixed(1)}
          </Text>
        </View>
        <PriceTag
          amount={getMinPrice(product)}
          compareAt={product.variants?.[0]?.compare_at_price}
          size="sm"
          {...dual}
        />
      </View>
    </Pressable>
  );
}

// ─── Boxes list ─────────────────────────────────────────────────
function BoxList({
  items,
  emptyLabel,
  endsInLabel,
  onPick,
}: {
  items: Product[];
  emptyLabel: string;
  endsInLabel: string;
  onPick: (p: Product) => void;
}) {
  if (!items.length) {
    return (
      <View className="items-center justify-center py-20">
        <View className="w-16 h-16 rounded-full bg-primary-tint items-center justify-center mb-3">
          <Tag size={26} color={brand.burgundy[600]} />
        </View>
        <Text className="font-body text-muted-foreground">{emptyLabel}</Text>
      </View>
    );
  }

  return (
    <View className="gap-4">
      {items.map((p) => (
        <BoxCard key={p.id} product={p} endsInLabel={endsInLabel} onPress={() => onPick(p)} />
      ))}
    </View>
  );
}

function BoxCard({
  product,
  endsInLabel,
  onPress,
}: {
  product: Product;
  endsInLabel: string;
  onPress: () => void;
}) {
  const v = product.variants?.[0];
  const img = getProductImage(product);
  const off =
    v?.compare_at_price && v.compare_at_price > v.price
      ? Math.round(((v.compare_at_price - v.price) / v.compare_at_price) * 100)
      : null;

  return (
    <Pressable
      onPress={onPress}
      className="bg-card rounded-3xl overflow-hidden border border-border"
      style={shadows.card}
    >
      <View className="flex-row gap-3 p-3">
        <View className="w-24 h-24 rounded-2xl overflow-hidden bg-muted relative">
          {img ? (
            <Image source={{ uri: img }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
          ) : null}
          {off != null && (
            <View className="absolute top-1 left-1 bg-primary px-2 py-0.5 rounded-full">
              <Text className="text-white text-[10px] font-body-bold">-{off}%</Text>
            </View>
          )}
        </View>
        <View className="flex-1 min-w-0">
          <Text className="font-body-bold text-[11px] uppercase tracking-widest text-gold-deep">
            Pack
          </Text>
          <Text className="font-display text-lg leading-6 text-foreground" numberOfLines={2}>
            {product.name}
          </Text>
          <View className="flex-row items-center gap-1 mt-1">
            <Clock size={12} color={brand.textSecondary} />
            <Text className="font-body text-xs text-muted-foreground">{endsInLabel} 02:14:33</Text>
          </View>
          <View className="flex-row items-baseline gap-2 mt-1.5">
            <Text className="font-display text-xl text-primary">
              €{Number(getMinPrice(product)).toFixed(2)}
            </Text>
            {v?.compare_at_price && (
              <Text className="font-body text-xs text-muted-foreground line-through">
                €{Number(v.compare_at_price).toFixed(2)}
              </Text>
            )}
            <View className="ml-auto">
              <Text className="font-body-bold text-[10px] uppercase text-primary">Ver →</Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

// ─── Bottom-sheet content: product ─────────────────────────────
function ProductSheet({
  product,
  onClose,
  onAdd,
  addLabel,
  qtyLabel,
  dualPriceProps,
}: {
  product: Product;
  onClose: () => void;
  onAdd: (qty: number) => Promise<void>;
  addLabel: string;
  qtyLabel: string;
  dualPriceProps: ReturnType<typeof buildDualPriceProps>;
}) {
  const [qty, setQty] = useState(1);
  const v = product.variants?.[0];
  const off =
    v?.compare_at_price && v.compare_at_price > v.price
      ? Math.round(((v.compare_at_price - v.price) / v.compare_at_price) * 100)
      : 0;
  const img = getProductImage(product);
  const price = getMinPrice(product);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="relative" style={{ height: 240 }}>
        {img ? (
          <Image source={{ uri: img }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
        ) : (
          <View className="w-full h-full bg-coal" />
        )}
        <Pressable
          onPress={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-card/95 items-center justify-center"
        >
          <X size={16} color={brand.coal[900]} />
        </Pressable>
        {off > 0 && (
          <View className="absolute top-4 left-4 bg-primary px-3 py-1.5 rounded-full">
            <Text className="text-white text-xs font-body-bold uppercase">-{off}% off</Text>
          </View>
        )}
      </View>

      <View className="p-6">
        {product.category_name && (
          <Text className="font-body-bold text-[11px] uppercase tracking-widest text-muted-foreground">
            {product.category_name}
          </Text>
        )}
        <Text className="font-display text-2xl leading-7 text-foreground mt-1" numberOfLines={3}>
          {product.name}
        </Text>
        <View className="flex-row items-center gap-2 mt-1.5">
          <Star size={13} fill="#C9A961" color="#C9A961" />
          <Text className="font-body-bold text-foreground text-xs">
            {Number(product.avg_rating ?? 0).toFixed(1)}
          </Text>
          <Text className="font-body text-xs text-muted-foreground">
            · {product.review_count ?? 0} reviews
          </Text>
          {v?.label && (
            <Text className="font-body text-xs text-muted-foreground">· {v.label}</Text>
          )}
        </View>

        <View className="mt-3">
          <PriceTag
            amount={price}
            compareAt={v?.compare_at_price}
            size="lg"
            {...dualPriceProps}
          />
        </View>

        {product.description && (
          <Text className="font-body text-sm text-muted-foreground leading-5 mt-3">
            {product.description}
          </Text>
        )}

        <View className="flex-row items-center justify-between bg-muted/50 rounded-2xl p-3 mt-4">
          <Text className="font-body-bold text-sm text-foreground">{qtyLabel}</Text>
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => setQty((q) => Math.max(1, q - 1))}
              className="w-9 h-9 rounded-xl bg-card border border-border items-center justify-center"
            >
              <Minus size={16} color={brand.coal[900]} />
            </Pressable>
            <Text className="font-display text-lg w-6 text-center text-foreground">{qty}</Text>
            <Pressable
              onPress={() => setQty((q) => q + 1)}
              className="w-9 h-9 rounded-xl bg-card border border-border items-center justify-center"
            >
              <Plus size={16} color={brand.coal[900]} />
            </Pressable>
          </View>
        </View>

        <Pressable
          onPress={() => onAdd(qty)}
          className="rounded-2xl overflow-hidden mt-5"
          style={shadows.button}
        >
          <Gradient
            name="primary"
            style={{
              height: 56,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Plus size={20} color="#FFFFFF" strokeWidth={2.6} />
            <Text className="font-body-bold text-white text-base">
              {addLabel} · €{(Number(price) * qty).toFixed(2)}
            </Text>
          </Gradient>
        </Pressable>
      </View>
    </ScrollView>
  );
}

// ─── Bottom-sheet content: box ─────────────────────────────────
function BoxSheet({
  product,
  onClose,
  onAdd,
  addLabel,
  insideLabel,
  endsInLabel,
  saveLabel,
}: {
  product: Product;
  onClose: () => void;
  onAdd: () => Promise<void>;
  addLabel: string;
  insideLabel: string;
  endsInLabel: string;
  saveLabel: string;
}) {
  const v = product.variants?.[0];
  const img = getProductImage(product);
  const off =
    v?.compare_at_price && v.compare_at_price > v.price
      ? Math.round(((v.compare_at_price - v.price) / v.compare_at_price) * 100)
      : 0;
  const save =
    v?.compare_at_price && v.compare_at_price > v.price ? v.compare_at_price - v.price : 0;
  const price = getMinPrice(product);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{ height: 220 }} className="relative">
        <ImageBackground
          source={img ? { uri: img } : undefined}
          style={{ flex: 1, backgroundColor: "#1A0F0F" }}
        >
          <Gradient name="overlay" style={{ flex: 1 }}>
            <View className="flex-1 justify-end p-5">
              {off > 0 && (
                <View className="self-start bg-primary px-2 py-1 rounded-full">
                  <Text className="text-white text-[10px] font-body-bold uppercase">
                    -{off}% off
                  </Text>
                </View>
              )}
              <Text className="font-display text-white text-2xl leading-7 mt-2" numberOfLines={2}>
                {product.name}
              </Text>
              <View className="flex-row items-center gap-1 mt-1">
                <Clock size={12} color="#FFFFFF" />
                <Text className="font-body text-white/85 text-xs">
                  {endsInLabel} 02:14:33
                </Text>
              </View>
            </View>
          </Gradient>
        </ImageBackground>
        <Pressable
          onPress={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-card/95 items-center justify-center"
        >
          <X size={16} color={brand.coal[900]} />
        </Pressable>
      </View>

      <View className="p-6">
        <View className="flex-row items-baseline gap-2">
          <Text className="font-display text-3xl text-primary">€{Number(price).toFixed(2)}</Text>
          {v?.compare_at_price && (
            <Text className="font-body text-sm text-muted-foreground line-through">
              €{Number(v.compare_at_price).toFixed(2)}
            </Text>
          )}
          {save > 0 && (
            <View className="ml-auto bg-gold/15 px-2 py-1 rounded-full">
              <Text className="font-body-bold text-[11px] text-gold-deep">
                {saveLabel} €{save.toFixed(0)}
              </Text>
            </View>
          )}
        </View>

        {(product.pack_items?.length ?? 0) > 0 && (
          <View className="mt-4">
            <Text className="font-body-bold text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
              {insideLabel}
            </Text>
            <View className="gap-2">
              {product.pack_items!.map((it) => (
                <View
                  key={it.id}
                  className="flex-row items-center justify-between bg-muted/40 rounded-xl px-3 py-2.5"
                >
                  <Text className="font-body-semibold text-sm text-foreground">
                    {it.product_name}
                  </Text>
                  <Text className="font-body text-xs text-muted-foreground">
                    {it.custom_label ?? `x${it.quantity}`}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <Pressable
          onPress={() => onAdd()}
          className="rounded-2xl overflow-hidden mt-5"
          style={shadows.button}
        >
          <Gradient
            name="primary"
            style={{
              height: 56,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Plus size={20} color="#FFFFFF" strokeWidth={2.6} />
            <Text className="font-body-bold text-white text-base">
              {addLabel} · €{Number(price).toFixed(2)}
            </Text>
          </Gradient>
        </Pressable>
      </View>
    </ScrollView>
  );
}
