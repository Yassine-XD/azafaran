/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{html,js,jsx,ts,tsx,mdx}',
    './components/**/*.{html,js,jsx,ts,tsx,mdx}',
    './utils/**/*.{html,js,jsx,ts,tsx,mdx}',
    './*.{html,js,jsx,ts,tsx,mdx}',
    './src/**/*.{html,js,jsx,ts,tsx,mdx}',
  ],
  presets: [require('nativewind/preset')],
  important: 'html',
  safelist: [
    {
      pattern:
        /(bg|border|text|stroke|fill)-(background|foreground|card|card-foreground|popover|popover-foreground|primary|primary-foreground|primary-deep|primary-tint|wine|wine-foreground|secondary|secondary-foreground|muted|muted-foreground|accent|accent-foreground|gold|gold-foreground|gold-deep|coal|coal-foreground|destructive|border|input|ring|chart-1|chart-2|chart-3|chart-4|chart-5|sidebar|sidebar-foreground|sidebar-primary|sidebar-primary-foreground|sidebar-accent|sidebar-accent-foreground|sidebar-border|sidebar-ring)/,
    },
    {
      pattern:
        /(bg|border|text|stroke|fill)-(burgundy|gold|coal|wine|parchment)-(50|100|200|300|400|500|600|700|800|900|950)/,
    },
  ],
  theme: {
    extend: {
      borderRadius: {
        DEFAULT: 'var(--radius)',
        lg: 'calc(var(--radius) * 1.5)',
        md: 'var(--radius)',
        sm: 'calc(var(--radius) * 0.5)',
      },
      colors: {
        // Semantic (shadcn) tokens
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',

        card: {
          DEFAULT: 'rgb(var(--card) / <alpha-value>)',
          foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
        },

        popover: {
          DEFAULT: 'rgb(var(--popover) / <alpha-value>)',
          foreground: 'rgb(var(--popover-foreground) / <alpha-value>)',
        },

        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
          deep: 'rgb(var(--primary-deep) / <alpha-value>)',
          tint: 'rgb(var(--primary-tint) / <alpha-value>)',
        },

        wine: {
          DEFAULT: 'rgb(var(--wine) / <alpha-value>)',
          foreground: 'rgb(var(--wine-foreground) / <alpha-value>)',
        },

        secondary: {
          DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
          foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)',
        },

        muted: {
          DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
        },

        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          foreground: 'rgb(var(--accent-foreground) / <alpha-value>)',
        },

        gold: {
          DEFAULT: 'rgb(var(--gold) / <alpha-value>)',
          foreground: 'rgb(var(--gold-foreground) / <alpha-value>)',
          deep: 'rgb(var(--gold-deep) / <alpha-value>)',
          50: '#FBF6E9',
          100: '#F5EACB',
          200: '#E9D595',
          300: '#D9BE74',
          400: '#C9A961',
          500: '#B28F45',
          600: '#8F7232',
          700: '#6C5623',
        },

        coal: {
          DEFAULT: 'rgb(var(--coal) / <alpha-value>)',
          foreground: 'rgb(var(--coal-foreground) / <alpha-value>)',
          700: '#3A2626',
          800: '#26181A',
          900: '#1A0F0F',
          950: '#0E0707',
        },

        burgundy: {
          50: '#FCF2F3',
          100: '#F7DDE1',
          200: '#EEB8BF',
          300: '#DE8B97',
          400: '#C85D6E',
          500: '#A12234',
          600: '#7A0E1F',
          700: '#5E0A17',
          800: '#420710',
          900: '#2A050A',
        },

        parchment: '#FAF6F1',

        destructive: {
          DEFAULT: 'rgb(var(--destructive) / <alpha-value>)',
        },

        border: 'rgb(var(--border) / <alpha-value>)',
        input: 'rgb(var(--input) / <alpha-value>)',
        ring: 'rgb(var(--ring) / <alpha-value>)',

        chart: {
          1: 'rgb(var(--chart-1) / <alpha-value>)',
          2: 'rgb(var(--chart-2) / <alpha-value>)',
          3: 'rgb(var(--chart-3) / <alpha-value>)',
          4: 'rgb(var(--chart-4) / <alpha-value>)',
          5: 'rgb(var(--chart-5) / <alpha-value>)',
        },

        sidebar: {
          'DEFAULT': 'rgb(var(--sidebar) / <alpha-value>)',
          'foreground': 'rgb(var(--sidebar-foreground) / <alpha-value>)',
          'primary': 'rgb(var(--sidebar-primary) / <alpha-value>)',
          'primary-foreground': 'rgb(var(--sidebar-primary-foreground) / <alpha-value>)',
          'accent': 'rgb(var(--sidebar-accent) / <alpha-value>)',
          'accent-foreground': 'rgb(var(--sidebar-accent-foreground) / <alpha-value>)',
          'border': 'rgb(var(--sidebar-border) / <alpha-value>)',
          'ring': 'rgb(var(--sidebar-ring) / <alpha-value>)',
        },
      },

      // Fonts are loaded in app/_layout.tsx via expo-font.
      fontFamily: {
        // Serif display — headlines, prices, section titles.
        'display': ['Fraunces_700Bold'],
        'display-medium': ['Fraunces_500Medium'],
        'display-semibold': ['Fraunces_600SemiBold'],
        'display-black': ['Fraunces_900Black'],
        'serif': ['Fraunces_400Regular'],
        'serif-bold': ['Fraunces_700Bold'],

        // Aliases kept for legacy callers.
        'heading': ['Fraunces_700Bold'],
        'heading-bold': ['Fraunces_700Bold'],

        // UI / body — Inter.
        'body': ['Inter_400Regular'],
        'body-medium': ['Inter_500Medium'],
        'body-semibold': ['Inter_600SemiBold'],
        'body-bold': ['Inter_700Bold'],
        'inter': ['Inter_400Regular'],
        'inter-medium': ['Inter_500Medium'],
        'inter-semibold': ['Inter_600SemiBold'],
        'inter-bold': ['Inter_700Bold'],

        'mono': ['JetBrainsMono_400Regular'],
        'mono-medium': ['JetBrainsMono_500Medium'],
        'jetbrains': ['JetBrainsMono_400Regular'],
        'jetbrains-medium': ['JetBrainsMono_500Medium'],
      },

      fontSize: {
        '2xs': '10px',
        'display-xl': ['40px', { lineHeight: '44px', letterSpacing: '-0.5px' }],
        'display': ['34px', { lineHeight: '40px', letterSpacing: '-0.3px' }],
        'price': ['28px', { lineHeight: '32px', letterSpacing: '-0.2px' }],
      },

      fontWeight: {
        extrablack: '950',
      },

      boxShadow: {
        // Burgundy-tinted depth. Used on cards and buttons.
        'card': '0px 6px 16px 0px rgba(42, 5, 10, 0.08)',
        'card-lift': '0px 12px 24px 0px rgba(42, 5, 10, 0.14)',
        'button': '0px 8px 14px 0px rgba(66, 7, 16, 0.18)',
        'gold-glow': '0px 6px 16px 0px rgba(178, 143, 69, 0.35)',
        'float': '0px 4px 10px 0px rgba(14, 7, 7, 0.16)',
        'sticky': '0px -4px 16px 0px rgba(42, 5, 10, 0.08)',
        // Legacy values kept for any remaining consumers.
        'hard-1': '-2px 2px 8px 0px rgba(38, 38, 38, 0.20)',
        'hard-2': '0px 3px 10px 0px rgba(38, 38, 38, 0.20)',
        'hard-3': '2px 2px 8px 0px rgba(38, 38, 38, 0.20)',
        'hard-4': '0px -3px 10px 0px rgba(38, 38, 38, 0.20)',
        'hard-5': '0px 2px 10px 0px rgba(38, 38, 38, 0.10)',
        'soft-1': '0px 0px 10px rgba(38, 38, 38, 0.1)',
        'soft-2': '0px 0px 20px rgba(38, 38, 38, 0.2)',
        'soft-3': '0px 0px 30px rgba(38, 38, 38, 0.1)',
        'soft-4': '0px 0px 40px rgba(38, 38, 38, 0.1)',
      },
    },
  },
};
