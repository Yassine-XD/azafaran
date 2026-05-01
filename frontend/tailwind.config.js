/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{html,js,jsx,ts,tsx,mdx}',
    './components/**/*.{html,js,jsx,ts,tsx,mdx}',
    './*.{html,js,jsx,ts,tsx,mdx}',
  ],
  presets: [require('nativewind/preset')],
  important: 'html',
  darkMode: 'class',
  safelist: [
    {
      pattern:
        /(bg|border|text|stroke|fill)-(background|foreground|surface|surface-foreground|card|card-foreground|muted|muted-foreground|primary|primary-foreground|accent|accent-foreground|halal|halal-foreground|sale|sale-foreground|border|input|ring)/,
    },
  ],
  theme: {
    extend: {
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        pill: '999px',
      },
      colors: {
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',

        surface: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          foreground: 'rgb(var(--surface-foreground) / <alpha-value>)',
        },

        card: {
          DEFAULT: 'rgb(var(--card) / <alpha-value>)',
          foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
        },

        muted: {
          DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
        },

        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
        },

        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          foreground: 'rgb(var(--accent-foreground) / <alpha-value>)',
        },

        halal: {
          DEFAULT: 'rgb(var(--halal) / <alpha-value>)',
          foreground: 'rgb(var(--halal-foreground) / <alpha-value>)',
        },

        sale: {
          DEFAULT: 'rgb(var(--sale) / <alpha-value>)',
          foreground: 'rgb(var(--sale-foreground) / <alpha-value>)',
        },

        border: 'rgb(var(--border) / <alpha-value>)',
        input: 'rgb(var(--input) / <alpha-value>)',
        ring: 'rgb(var(--ring) / <alpha-value>)',
      },

      fontFamily: {
        // Display uses Inter at heavier weights with tight tracking — set in
        // typography primitives, not declared here as a separate family.
        display: ['Inter_700Bold'],
        'display-semibold': ['Inter_600SemiBold'],
        body: ['Inter_400Regular'],
        'body-medium': ['Inter_500Medium'],
        'body-semibold': ['Inter_600SemiBold'],
        'body-bold': ['Inter_700Bold'],
        sans: ['Inter_400Regular'],
        // Mono — only on prices to give them weight
        mono: ['JetBrainsMono_400Regular'],
        'mono-medium': ['JetBrainsMono_500Medium'],
        'mono-semibold': ['JetBrainsMono_600SemiBold'],
      },

      fontSize: {
        '2xs': ['10px', { lineHeight: '14px' }],
        micro: ['11px', { lineHeight: '14px', letterSpacing: '0.2px' }],
        caption: ['12px', { lineHeight: '16px' }],
        small: ['13px', { lineHeight: '18px' }],
        body: ['15px', { lineHeight: '22px' }],
        h3: ['17px', { lineHeight: '22px', letterSpacing: '-0.2px' }],
        h2: ['20px', { lineHeight: '26px', letterSpacing: '-0.3px' }],
        h1: ['26px', { lineHeight: '32px', letterSpacing: '-0.5px' }],
        display: ['32px', { lineHeight: '38px', letterSpacing: '-0.6px' }],
        price: ['24px', { lineHeight: '28px', letterSpacing: '-0.4px' }],
        'price-lg': ['30px', { lineHeight: '34px', letterSpacing: '-0.6px' }],
      },

      boxShadow: {
        card: '0px 1px 6px 0px rgba(0, 0, 0, 0.04)',
        'card-lift': '0px 8px 20px 0px rgba(0, 0, 0, 0.08)',
        sheet: '0px -4px 16px 0px rgba(0, 0, 0, 0.06)',
        sticky: '0px -1px 8px 0px rgba(0, 0, 0, 0.05)',
      },
    },
  },
};
