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

