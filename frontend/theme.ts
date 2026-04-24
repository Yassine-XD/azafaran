import { vars } from "nativewind";

/**
 * Azafarán design tokens.
 * Brand: premium halal butcher with Moroccan heritage.
 * Palette: burgundy as anchor, warm-red for active states, gold for premium
 * touches, deep coal for hero/splash backgrounds, warm parchment base.
 */

// ─── Raw brand palette (hex) ──────────────────────────────────────────────────
// Exposed for hex-only consumers (React Navigation, StatusBar, gradients).
export const brand = {
  burgundy: {
    50: "#FCF2F3",
    100: "#F7DDE1",
    200: "#EEB8BF",
    300: "#DE8B97",
    400: "#C85D6E",
    500: "#A12234", // hover / focus ring
    600: "#7A0E1F", // PRIMARY anchor
    700: "#5E0A17",
    800: "#420710",
    900: "#2A050A",
  },
  wine: {
    500: "#B91C1C", // active CTA / accent red
    600: "#991B1B",
  },
  gold: {
    50: "#FBF6E9",
    100: "#F5EACB",
    200: "#E9D595",
    300: "#D9BE74",
    400: "#C9A961", // PRIMARY gold
    500: "#B28F45",
    600: "#8F7232",
    700: "#6C5623",
  },
  coal: {
    700: "#3A2626",
    800: "#26181A",
    900: "#1A0F0F", // dark surface (splash, hero overlays)
    950: "#0E0707",
  },
  parchment: "#FAF6F1", // base background
  card: "#FFFFFF",
  textPrimary: "#1A0F0F",
  textSecondary: "#6B5D5D",
  textMuted: "#9A8C8C",
  border: "#EADBD1",
  borderSoft: "#F2E7DD",
};

// ─── Typography ───────────────────────────────────────────────────────────────
export interface ThemeFonts {
  display: { family: string; weights: Record<string, string> };
  heading: { family: string; weights: Record<string, string> };
  body: { family: string; weights: Record<string, string> };
  mono: { family: string; weights: Record<string, string> };
}

export const themeFonts: ThemeFonts = {
  // Serif display — headlines, prices, section titles. Loaded via
  // @expo-google-fonts/fraunces in app/_layout.tsx.
  display: {
    family: "Fraunces",
    weights: {
      regular: "Fraunces_400Regular",
      medium: "Fraunces_500Medium",
      semibold: "Fraunces_600SemiBold",
      bold: "Fraunces_700Bold",
      black: "Fraunces_900Black",
    },
  },
  // Alias for the serif — kept so existing `font-heading` classes still resolve.
  heading: {
    family: "Fraunces",
    weights: {
      semibold: "Fraunces_600SemiBold",
      bold: "Fraunces_700Bold",
    },
  },
  // UI / body — Inter. Loaded via @expo-google-fonts/inter.
  body: {
    family: "Inter",
    weights: {
      regular: "Inter_400Regular",
      medium: "Inter_500Medium",
      semibold: "Inter_600SemiBold",
      bold: "Inter_700Bold",
    },
  },
  mono: {
    family: "JetBrainsMono",
    weights: {
      regular: "JetBrainsMono_400Regular",
      medium: "JetBrainsMono_500Medium",
    },
  },
};

// ─── Type scale ───────────────────────────────────────────────────────────────
export const typeScale = {
  displayXL: { size: 40, leading: 44, weight: "bold" as const },
  display: { size: 34, leading: 40, weight: "bold" as const },
  h1: { size: 28, leading: 34, weight: "bold" as const },
  h2: { size: 22, leading: 28, weight: "semibold" as const },
  h3: { size: 18, leading: 24, weight: "semibold" as const },
  body: { size: 15, leading: 22, weight: "regular" as const },
  bodyMedium: { size: 15, leading: 22, weight: "medium" as const },
  small: { size: 13, leading: 18, weight: "regular" as const },
  caption: { size: 12, leading: 16, weight: "medium" as const },
  overline: { size: 11, leading: 14, weight: "semibold" as const },
};

// ─── Spacing / radius / shadows ───────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
  "4xl": 64,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 28,
  pill: 999,
};

export const shadows = {
  // Burgundy-tinted depth — subtle but real. Used on cards, buttons, sticky bars.
  card: {
    shadowColor: brand.burgundy[900],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  cardLift: {
    shadowColor: brand.burgundy[900],
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 10,
  },
  button: {
    shadowColor: brand.burgundy[800],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 6,
  },
  // Gold-tinted for premium CTAs (halal pill, featured packs, splash button).
  goldGlow: {
    shadowColor: brand.gold[500],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  float: {
    shadowColor: brand.coal[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 6,
  },
};

// ─── Semantic CSS vars (shadcn/NativeWind contract) ───────────────────────────
// Existing screens still use `bg-primary`, `text-foreground`, etc. Keep the same
// names so nothing breaks while we migrate — the *values* are what changed.
export const lightTheme = vars({
  "--radius": "16",

  "--background": "250 246 241", // parchment
  "--foreground": "26 15 15", // coal-900 text

  "--card": "255 255 255",
  "--card-foreground": "26 15 15",

  "--popover": "255 255 255",
  "--popover-foreground": "26 15 15",

  "--primary": "122 14 31", // burgundy-600
  "--primary-foreground": "255 255 255",

  "--primary-deep": "66 7 16", // burgundy-800 for pressed / dark accents
  "--primary-tint": "252 242 243", // burgundy-50

  "--wine": "185 28 28", // warm red CTA accent
  "--wine-foreground": "255 255 255",

  "--secondary": "245 234 203", // gold-100
  "--secondary-foreground": "108 86 35", // gold-700

  "--muted": "242 231 221", // borderSoft
  "--muted-foreground": "107 93 93", // text-secondary

  "--accent": "201 169 97", // gold-400
  "--accent-foreground": "26 15 15",

  "--gold": "201 169 97",
  "--gold-foreground": "26 15 15",
  "--gold-deep": "143 114 50", // gold-600

  "--coal": "26 15 15", // dark surface
  "--coal-foreground": "250 246 241",

  "--destructive": "185 28 28",

  "--border": "234 219 209",
  "--input": "255 255 255",
  "--ring": "122 14 31",

  "--chart-1": "122 14 31",
  "--chart-2": "201 169 97",
  "--chart-3": "185 28 28",
  "--chart-4": "107 93 93",
  "--chart-5": "26 15 15",

  "--sidebar": "250 246 241",
  "--sidebar-foreground": "26 15 15",
  "--sidebar-primary": "122 14 31",
  "--sidebar-primary-foreground": "255 255 255",
  "--sidebar-accent": "245 234 203",
  "--sidebar-accent-foreground": "108 86 35",
  "--sidebar-border": "234 219 209",
  "--sidebar-ring": "122 14 31",
});
