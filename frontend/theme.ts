import { vars } from "nativewind";

/**
 * Azafarán design tokens — Apple-minimal rebuild.
 *
 * Calm white surfaces, near-black ink for primary actions, two reserved
 * accent colors used exclusively as semantic signals (halal trust, sale red).
 * Single typeface for UI (Inter), one display weight for moments of voice
 * (Inter Tight), monospace only for prices.
 */

// ─── Raw palette (hex) ────────────────────────────────────────────────────────
export const ink = {
  0: "#FFFFFF",
  50: "#FAFAFA",
  100: "#F4F4F5",
  200: "#E5E5E7",
  300: "#D4D4D8",
  400: "#A1A1A6",
  500: "#6B6B70",
  600: "#48484C",
  700: "#2A2A2E",
  800: "#1F1F22",
  900: "#0B0B0C",
};

export const halalGreen = "#0F7A4A";
export const saleRed = "#D6342C";

// Single-purpose accents. Use sparingly.
export const accent = {
  trust: halalGreen, // halal certification chip only
  sale: saleRed, // strikethrough anchor / urgency only
};

// ─── Typography ───────────────────────────────────────────────────────────────
export const themeFonts = {
  // Display uses Inter at heavier weights with negative letter-spacing applied
  // at the tailwind level — same visual feel as SF Pro Display without needing
  // a second font family.
  display: {
    family: "Inter",
    weights: {
      semibold: "Inter_600SemiBold",
      bold: "Inter_700Bold",
    },
  },
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
      semibold: "JetBrainsMono_600SemiBold",
    },
  },
};

export const typeScale = {
  display: { size: 32, leading: 38, weight: "bold" as const },
  h1: { size: 26, leading: 32, weight: "bold" as const },
  h2: { size: 20, leading: 26, weight: "semibold" as const },
  h3: { size: 17, leading: 22, weight: "semibold" as const },
  body: { size: 15, leading: 22, weight: "regular" as const },
  bodyMedium: { size: 15, leading: 22, weight: "medium" as const },
  small: { size: 13, leading: 18, weight: "regular" as const },
  caption: { size: 12, leading: 16, weight: "medium" as const },
  micro: { size: 11, leading: 14, weight: "medium" as const },
};

// ─── Spacing / radius / shadows ───────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 48,
  "5xl": 64,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  pill: 999,
};

export const shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardLift: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  sheet: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 10,
  },
  sticky: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
};

// ─── Semantic CSS vars (NativeWind / shadcn contract) ─────────────────────────
// Light is the default. Dark mode mirrors the same names with inverted ink.
export const lightTheme = vars({
  "--radius": "16",

  "--background": "255 255 255",
  "--foreground": "11 11 12",

  "--surface": "250 250 250",
  "--surface-foreground": "11 11 12",

  "--card": "255 255 255",
  "--card-foreground": "11 11 12",

  "--muted": "244 244 245",
  "--muted-foreground": "107 107 112",

  "--primary": "31 31 34", // near-black CTA
  "--primary-foreground": "255 255 255",

  "--accent": "11 11 12",
  "--accent-foreground": "255 255 255",

  "--halal": "15 122 74",
  "--halal-foreground": "255 255 255",

  "--sale": "214 52 44",
  "--sale-foreground": "255 255 255",

  "--border": "229 229 231",
  "--input": "255 255 255",
  "--ring": "31 31 34",
});

export const darkTheme = vars({
  "--radius": "16",

  "--background": "11 11 12",
  "--foreground": "245 245 245",

  "--surface": "20 20 22",
  "--surface-foreground": "245 245 245",

  "--card": "20 20 22",
  "--card-foreground": "245 245 245",

  "--muted": "31 31 34",
  "--muted-foreground": "161 161 166",

  "--primary": "245 245 245",
  "--primary-foreground": "11 11 12",

  "--accent": "245 245 245",
  "--accent-foreground": "11 11 12",

  "--halal": "20 160 95",
  "--halal-foreground": "11 11 12",

  "--sale": "239 79 71",
  "--sale-foreground": "11 11 12",

  "--border": "42 42 46",
  "--input": "20 20 22",
  "--ring": "245 245 245",
});
