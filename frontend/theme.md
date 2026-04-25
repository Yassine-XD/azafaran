# Azafarán Theme Guide

This is the design system for the customer mobile/web app. Tokens live in
`theme.ts` and are wired into Tailwind via `tailwind.config.js`.

> **Brand:** premium halal butcher with Moroccan heritage.
> **Tagline:** *"El oro rojo de las carnes."*

---

## Colors

The palette anchors on **burgundy** (`#7A0E1F`) with **gold** (`#C9A961`) as
the heritage accent and **coal** (`#1A0F0F`) for dark surfaces.

### Brand palette (raw)

Imported via `import { brand } from "@/theme"`. Use these only when you need a
hex value (status bar, gradients, charts, navigation tinting). For UI styling,
prefer Tailwind classes.

| Token              | Hex       | Tailwind class       | Use                              |
| ------------------ | --------- | -------------------- | -------------------------------- |
| `burgundy.600`     | `#7A0E1F` | `bg-primary`         | Primary brand, anchor CTA        |
| `burgundy.500`     | `#A12234` | `bg-burgundy-500`    | Hover / focus ring               |
| `burgundy.800`     | `#420710` | `bg-primary-deep`    | Pressed, deep accents            |
| `wine`             | `#B91C1C` | `bg-wine`            | Active red (deals, urgency)      |
| `gold.400`         | `#C9A961` | `bg-gold`            | Halal badge, premium CTAs        |
| `gold.600`         | `#8F7232` | `bg-gold-deep`       | Gold text on light surfaces      |
| `coal.900`         | `#1A0F0F` | `bg-coal`            | Splash, hero overlay, dark slabs |
| `parchment`        | `#FAF6F1` | `bg-background`      | Base page background             |
| `card`             | `#FFFFFF` | `bg-card`            | Card / surface                   |
| `textPrimary`      | `#1A0F0F` | `text-foreground`    | Primary text                     |
| `textSecondary`    | `#6B5D5D` | `text-muted-foreground` | Secondary text                |
| `border`           | `#EADBD1` | `border-border`      | Default border                   |

### Semantic tokens (CSS vars)

`theme.ts` exposes these via NativeWind `vars()`. They are the public contract
— always prefer semantic over raw.

| Tailwind class            | Token             | Meaning                          |
| ------------------------- | ----------------- | -------------------------------- |
| `bg-background`           | `--background`    | Page bg (parchment)              |
| `text-foreground`         | `--foreground`    | Default text                     |
| `bg-card` / `text-card-fg`| `--card*`         | Surface background               |
| `bg-primary`              | `--primary`       | Burgundy 600                     |
| `bg-primary-tint`         | `--primary-tint`  | Burgundy 50 (subtle wash)        |
| `bg-primary-deep`         | `--primary-deep`  | Burgundy 800 (pressed)           |
| `bg-wine`                 | `--wine`          | Active red CTA accent            |
| `bg-gold` / `text-gold`   | `--gold*`         | Halal / premium                  |
| `bg-coal` / `text-coal`   | `--coal*`         | Dark surface                     |
| `bg-secondary`            | `--secondary`     | Soft gold-100 surface            |
| `bg-muted`                | `--muted`         | Soft borderless surface          |
| `text-muted-foreground`   | `--muted-fg`      | Secondary text                   |
| `border-border`           | `--border`        | Default border                   |
| `bg-destructive`          | `--destructive`   | Errors                           |

---

## Typography

Two families are loaded in `app/_layout.tsx` via `useAppFonts()`
(see `hooks/useAppFonts.ts`). Splash is gated until they're ready.

| Family    | Source                          | Used for                              |
| --------- | ------------------------------- | ------------------------------------- |
| **Fraunces** | `@expo-google-fonts/fraunces`  | Display, headlines, **prices**, section titles |
| **Inter**   | `@expo-google-fonts/inter`     | UI / body / labels / buttons          |

### Tailwind classes

| Class                   | Resolves to              | Notes                            |
| ----------------------- | ------------------------ | -------------------------------- |
| `font-display`          | `Fraunces_700Bold`       | Headlines, hero, prices          |
| `font-display-semibold` | `Fraunces_600SemiBold`   | Section titles, product names    |
| `font-display-medium`   | `Fraunces_500Medium`     | Subdued display                  |
| `font-display-black`    | `Fraunces_900Black`      | Brand wordmark on splash         |
| `font-serif`            | `Fraunces_400Regular`    | Italic taglines                  |
| `font-body`             | `Inter_400Regular`       | Body text                        |
| `font-body-medium`      | `Inter_500Medium`        | Captions                         |
| `font-body-semibold`    | `Inter_600SemiBold`      | UI labels, eyebrows              |
| `font-body-bold`        | `Inter_700Bold`          | Buttons, badges                  |

### Type scale

Strong contrast between display and body. Use `font-display` for everything
people read **slowly** (titles, prices) and `font-body*` for everything they
read **quickly** (labels, descriptions, captions).

| Token       | Size  | Leading | Weight     | Use                       |
| ----------- | ----- | ------- | ---------- | ------------------------- |
| Display XL  | 40    | 44      | bold       | Splash brand              |
| Display     | 30–34 | 36–40   | bold       | Hero / detail title       |
| H1          | 28    | 34      | bold       | Tab screen titles         |
| H2          | 22    | 28      | semibold   | Section headers           |
| H3          | 18    | 24      | semibold   | Card titles               |
| Body        | 15    | 22      | regular    | Default body              |
| Small       | 13    | 18      | regular    | Secondary text            |
| Caption     | 12    | 16      | medium     | Helper text               |
| Overline    | 11    | 14      | semibold   | UPPERCASE LABELS          |

Eyebrows / overlines: `font-body-semibold text-[11px] uppercase tracking-widest text-muted-foreground`.

---

## Shadows

All shadows are **burgundy-tinted** (or gold-tinted for premium CTAs) — they
read as warm depth, not generic gray.

| Tailwind class       | `theme.shadows.*` | Use                                      |
| -------------------- | ----------------- | ---------------------------------------- |
| `shadow-card`        | `card`            | Default card / surface                   |
| `shadow-card-lift`   | `cardLift`        | Hero cards, editorial categories         |
| `shadow-button`      | `button`          | Primary button base                      |
| `shadow-gold-glow`   | `goldGlow`        | Premium CTAs (splash, halal badge)       |
| `shadow-float`       | `float`           | Floating buttons over images             |
| `shadow-sticky`      | `sticky`          | Sticky bottom CTA bar (upward shadow)    |

Native components (`Card`, `Button`, etc.) consume the JS-side shadow objects
directly via `style={shadows.card}` — Tailwind classes are only useful on web
since RN doesn't honor `boxShadow` everywhere.

---

## Radii

Base `--radius` is **16px** — bigger than v1 to feel modern and editorial.

| Class        | Computes to       |
| ------------ | ----------------- |
| `rounded`    | 16                |
| `rounded-sm` | 8                 |
| `rounded-lg` | 24                |
| `rounded-2xl`| 28 (cards, hero)  |
| `rounded-3xl`| editorial photo cards |
| `rounded-full` | pills, chips, avatars |

---

## UI primitives (`components/ui/`)

All exported from `@/components/ui`.

| Component       | Purpose                                                     |
| --------------- | ----------------------------------------------------------- |
| `Button`        | 48/56-px height, 5 variants (primary/dark/gold/outline/ghost), reanimated press |
| `Card`          | Surface with burgundy-tinted shadow, optional `onPress` for lift-on-press |
| `Badge`         | Generic pill (gold/burgundy/coal/neutral)                   |
| `HalalBadge`    | Gold pill with shield icon — always glows                   |
| `PriceTag`      | Serif price with optional compare-at strikethrough          |
| `SectionHeader` | Left accent bar (burgundy/gold) + serif title + optional CTA |
| `Chip`          | Pill filter chip with active fill                           |
| `HeroBanner`    | Full-bleed dark image + gradient + serif headline + gold CTA |
| `ProductCard`   | Reusable product card (home rail / shop grid)               |
| `MoroccanPattern` | SVG zellige tile overlay for the splash                   |

---

## Adding a color or token

1. Add the value to the brand object or `lightTheme` vars in `theme.ts`.
2. If it's semantic (page-level), expose it as a CSS var and add it to
   `tailwind.config.js` under `theme.extend.colors`.
3. If it's a raw scale step, add it directly under
   `theme.extend.colors.<scale>` so the class becomes available.
4. Add it to the `safelist` regex in `tailwind.config.js` so it's not
   tree-shaken out of dev builds.

---

## Don'ts

- ❌ Don't import hex values inline. Import from `brand` or use Tailwind classes.
- ❌ Don't use Tailwind grays — text is always `text-foreground` / `text-muted-foreground`.
- ❌ Don't use plain shadows like `shadow-md`. Use the burgundy-tinted scale.
- ❌ Don't put titles in Inter. Display work belongs to Fraunces.
- ❌ Don't put body in Fraunces. It's a serif — long body copy gets fatiguing.
- ❌ Don't add a new font. The two-family system is the brand.
