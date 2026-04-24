export type Lang = "es" | "ca" | "en";

export const LANGS: Lang[] = ["es", "ca", "en"];

export const SITE = {
  name: "Azafaran",
  legalName: "Azafaran",
  url: "https://www.azafaran.es",
  email: "hola@azafaran.es",
  phone: "+34647636189",
  phoneDisplay: "+34 647 63 61 89",
  whatsappUrl: "https://wa.me/34647636189",
  address: {
    street: "Carrer de la Torreta, 37",
    postalCode: "08810",
    locality: "Sant Pere de Ribes",
    region: "Barcelona",
    country: "ES",
  },
  social: {
    instagram: "https://instagram.com/azafaran1",
    facebook: "https://facebook.com/azafaran1",
  },
  app: {
    appStore: "https://apps.apple.com/app/azafaran",
    playStore:
      "https://play.google.com/store/apps/details?id=es.azafaran.app",
    bundleId: "es.azafaran.app",
  },
  freeShippingThreshold: 30,
  priceRange: "€€",
  foundingYear: 2024,
} as const;

export const LANG_LABEL: Record<Lang, string> = {
  es: "Castellano",
  ca: "Català",
  en: "English",
};

export const LANG_SHORT: Record<Lang, string> = {
  es: "ES",
  ca: "CA",
  en: "EN",
};

export const langPath = (lang: Lang): string =>
  lang === "es" ? "/" : `/${lang}/`;

export const langUrl = (lang: Lang): string =>
  `${SITE.url}${langPath(lang)}`;
