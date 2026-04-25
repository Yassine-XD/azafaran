# Layout Guide — Azafarán

How to build screens and compose primitives in this app. The design system is
in `theme.ts` / `theme.md`. The reusable building blocks live under
`components/ui/` and are re-exported from `@/components/ui`.

---

## Core principles

1. **Active, not passive** — every screen has a focal point and a strong CTA.
2. **Depth through tone, not box shadows** — burgundy-tinted shadows + dark
   coal slabs + parchment base do the heavy lifting. Avoid generic gray drop
   shadows.
3. **Typography hierarchy first** — display (Fraunces) for slow reading,
   body (Inter) for fast reading. **Prices are always Fraunces.**
4. **Edge-to-edge imagery** — kill white padding around food photos. Images
   are full-bleed in cards and heroes.
5. **Moroccan accent, sparingly** — the geometric motif appears only on the
   splash and as subtle dividers. Don't overdo it.

---

## Screen template

```tsx
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StatusBar, Text, View } from "react-native";

export default function Screen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="px-5 pt-2 pb-4">
        <Text className="font-body-semibold text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
          Azafarán
        </Text>
        <Text className="font-display text-[30px] leading-9 text-foreground">
          Screen Title
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 128, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* content */}
      </ScrollView>
    </SafeAreaView>
  );
}
```

**Defaults:**
- `bg-background` (parchment) on the root.
- `edges={["top", "left", "right"]}` on tab screens. The tab bar handles the
  bottom inset — adding `bottom` doubles the gap.
- Horizontal page padding: **`px-5`** (20px) for tab screens; **`px-6`** is
  fine for stacked screens that need a touch more breathing room.
- Bottom padding for tab bar clearance: **`128`**.

---

## Composition patterns

### Section header with left accent bar

```tsx
import { SectionHeader } from "@/components/ui";

<View className="px-5 mb-4">
  <SectionHeader
    title={t("home.featured")}
    eyebrow={t("home.halal_badge")}
    accent="gold"
    actionLabel={t("home.see_all")}
    onActionPress={openShop}
  />
</View>
```

Use `accent="gold"` on premium / halal-themed sections, `"burgundy"` (default)
elsewhere.

### Horizontal product rail

```tsx
import { FlatList } from "react-native";
import { ProductCard } from "@/components/ui";

<FlatList
  data={products}
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
  keyExtractor={(p) => p.id}
  renderItem={({ item }) => (
    <ProductCard
      image={getProductImage(item)}
      name={item.name}
      category={item.category_name}
      price={getMinPrice(item)}
      rating={item.avg_rating}
      onPress={() => router.push({ pathname: "/product-detail", params: { id: item.id } })}
    />
  )}
/>
```

### 2-column product grid

```tsx
<View className="flex-row flex-wrap" style={{ gap: 12 }}>
  {items.map((item) => (
    <View key={item.id} style={{ width: "48.5%" }}>
      <ProductCard width="full" {...} />
    </View>
  ))}
</View>
```

### Filter chip rail

```tsx
import { Chip } from "@/components/ui";

<ScrollView horizontal contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
  <Chip label="Todos" active={!filter} onPress={() => setFilter(null)} />
  {categories.map((c) => (
    <Chip key={c.id} label={c.name} active={filter === c.slug} onPress={() => setFilter(c.slug)} />
  ))}
  <Chip label="Ofertas" tone="wine" active={dealsOnly} onPress={toggleDeals} />
</ScrollView>
```

### Hero banner

Always pair a serif headline with a gold CTA pill. The gradient (top-light →
bottom-coal) ensures the title is always legible regardless of image content.

```tsx
import { HeroBanner } from "@/components/ui";

<View className="px-5 mb-7">
  <HeroBanner
    eyebrow={t("home.hero_eyebrow")}
    title={t("home.hero_title")}
    subtitle={t("home.hero_subtitle")}
    ctaLabel={t("home.hero_cta")}
    onCtaPress={() => router.push("/deals")}
    imageUrl={banner?.image_url}
  />
</View>
```

### Sticky bottom CTA bar

Use this on detail screens. The bar is **outside** the ScrollView and absolute-positioned with a SafeAreaView for bottom inset.

```tsx
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
      <Button label={t("product.add_to_cart")} onPress={addToCart} />
    </View>
  </View>
</SafeAreaView>
```

### Glassmorphism floating buttons (over images)

Use `expo-blur`'s `BlurView` natively, plain `backdropFilter` on web. See
`app/product-detail.tsx` for the `GlassIconButton` reference implementation.

### Status accent bar on order cards

5px-wide colored stripe on the left edge of the card, color-keyed to status:

```tsx
<View className="bg-card rounded-2xl overflow-hidden flex-row" style={shadows.card}>
  <View style={{ width: 5, backgroundColor: status.accentHex }} />
  <View className="flex-1 p-4">{/* … */}</View>
</View>
```

---

## Tab bar

`app/(tabs)/_layout.tsx` configures the bar. Active tint is `#7A0E1F`
(burgundy 600), inactive is `#9A8C8C`. Labels use `Inter_600SemiBold` at 11px.

Never add `height`, `paddingBottom`, or `paddingTop` to `tabBarStyle` —
React Navigation handles the safe-area inset and a manual override breaks
the layout.

---

## Buttons

Use the `Button` primitive — don't roll your own `<TouchableOpacity>` wrappers.

| Variant     | When to use                                              |
| ----------- | -------------------------------------------------------- |
| `primary`   | Default brand CTA — burgundy fill                        |
| `dark`      | Dark surfaces (splash, hero overlays)                    |
| `gold`      | Premium / heritage CTAs (halal-themed)                   |
| `outline`   | Secondary action when there's already a primary on screen |
| `ghost`     | Tertiary text-only action                                |

Default `size` is `lg` (56px). Use `md` (48px) only inside cards or rows.

---

## Spacing

All spacing comes from Tailwind's default scale. The most-used values:

| Class | Pixel | Use                              |
| ----- | ----- | -------------------------------- |
| `gap-1.5` | 6  | tight icon + label rows          |
| `gap-2`   | 8  | chip rows                        |
| `gap-3`   | 12 | card content rows                |
| `gap-4`   | 16 | between sections inside a card   |
| `mb-4`    | 16 | between section header and rail  |
| `mb-6`    | 24 | between sections inside a screen |
| `mb-8`    | 32 | between major content blocks     |
| `pb-32`   | 128| ScrollView clearance for tab bar |

Prefer `gap-*` on the parent over individual `mb-*` on children.

---

## i18n

All user-visible strings go through `t()` from `useLang()`. Keys are
dot-notation (`t("home.hero_title")`). When adding a new key:

1. Add it to the `es` object first (source of truth).
2. Add the matching key to `ca` and `en` — the `const ca: typeof es = …`
   pattern enforces this with a TypeScript error.
3. Don't interpolate Spanish-specific things (currency formatting,
   pluralization) — keep those at the call site.

Full guide: `frontend/I18N_MANUAL.md`.

---

## Don'ts

- ❌ Don't introduce gray text via Tailwind defaults (`text-gray-500`). Use
  `text-muted-foreground` or `text-foreground/70`.
- ❌ Don't roll your own card or button — extend `components/ui/` instead.
- ❌ Don't put the halal badge anywhere small or grey. It's gold, prominent,
  and always glows.
- ❌ Don't pad meat product images with white. Image is the bleed layer of
  the card.
- ❌ Don't reorder providers in `app/_layout.tsx`. Order is:
  `ErrorBoundary > ThemeProvider > SafeAreaProvider > StripeProviderWrapper >
  LanguageProvider > AuthProvider > CartProvider > NavigationGuard`.
