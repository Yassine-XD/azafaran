import { vars } from "nativewind";

export interface ThemeFonts {
  heading: {
    family: string;
    weights: Record<string, string>;
  };
  body: {
    family: string;
    weights: Record<string, string>;
  };
  mono: {
    family: string;
    weights: Record<string, string>;
  };
}

export const themeFonts: ThemeFonts = {
  heading: {
    family: 'Inter',
    weights: {
      normal: 'Inter_400Regular',
      medium: 'Inter_500Medium',
      semibold: 'Inter_600SemiBold',
      bold: 'Inter_700Bold',
    },
  },
  body: {
    family: 'Inter',
    weights: {
      normal: 'Inter_400Regular',
      medium: 'Inter_500Medium',
      semibold: 'Inter_600SemiBold',
    },
  },
  mono: {
    family: 'JetBrainsMono',
    weights: {
      normal: 'JetBrainsMono_400Regular',
      medium: 'JetBrainsMono_500Medium',
    },
  },
};

// Warm amber/orange theme for meat delivery app
export const lightTheme = vars({
  "--radius": "12",

  "--background": "255 251 247",
  "--foreground": "28 25 23",

  "--card": "255 255 255",
  "--card-foreground": "28 25 23",

  "--popover": "255 255 255",
  "--popover-foreground": "28 25 23",

  "--primary": "102 7 16",
  "--primary-foreground": "255 255 255",

  "--secondary": "254 243 199",
  "--secondary-foreground": "120 53 15",

  "--muted": "250 248 244",
  "--muted-foreground": "120 113 108",

  "--accent": "251 191 36",
  "--accent-foreground": "120 53 15",

  "--destructive": "220 38 38",

  "--border": "245 238 228",
  "--input": "250 248 244",
  "--ring": "102 7 16",

  "--chart-1": "102 7 16",
  "--chart-2": "180 83 9",
  "--chart-3": "120 53 15",
  "--chart-4": "251 191 36",
  "--chart-5": "245 158 11",

  "--sidebar": "250 248 244",
  "--sidebar-foreground": "28 25 23",
  "--sidebar-primary": "102 7 16",
  "--sidebar-primary-foreground": "255 255 255",
  "--sidebar-accent": "254 243 199",
  "--sidebar-accent-foreground": "120 53 15",
  "--sidebar-border": "245 238 228",
  "--sidebar-ring": "102 7 16",
});

export const darkTheme = vars({
  "--radius": "12",

  "--background": "24 20 17",
  "--foreground": "252 251 248",

  "--card": "35 32 28",
  "--card-foreground": "252 251 248",

  "--popover": "45 42 38",
  "--popover-foreground": "252 251 248",

  "--primary": "251 146 60",
  "--primary-foreground": "28 25 23",

  "--secondary": "58 52 42",
  "--secondary-foreground": "253 224 71",

  "--muted": "58 52 42",
  "--muted-foreground": "168 162 148",

  "--accent": "180 83 9",
  "--accent-foreground": "254 243 199",

  "--destructive": "248 113 113",

  "--border": "58 52 42",
  "--input": "58 52 42",
  "--ring": "251 146 60",

  "--chart-1": "251 146 60",
  "--chart-2": "245 158 11",
  "--chart-3": "180 83 9",
  "--chart-4": "217 70 239",
  "--chart-5": "168 85 247",

  "--sidebar": "35 32 28",
  "--sidebar-foreground": "252 251 248",
  "--sidebar-primary": "251 146 60",
  "--sidebar-primary-foreground": "28 25 23",
  "--sidebar-accent": "58 52 42",
  "--sidebar-accent-foreground": "253 224 71",
  "--sidebar-border": "58 52 42",
  "--sidebar-ring": "251 146 60",
});