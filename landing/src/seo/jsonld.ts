import type { Dict } from "../i18n/types";
import { SITE, langUrl, type Lang } from "./constants";

const langCode: Record<Lang, string> = {
  es: "es-ES",
  ca: "ca-ES",
  en: "en-US",
};

export function buildJsonLd(lang: Lang, t: Dict): string {
  const url = langUrl(lang);
  const sameAs = [SITE.social.instagram, SITE.social.facebook];

  const organization = {
    "@type": "Organization",
    "@id": `${SITE.url}#organization`,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    logo: `${SITE.url}/images/app-icon.png`,
    email: SITE.email,
    telephone: SITE.phone,
    sameAs,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: SITE.phone,
        email: SITE.email,
        contactType: "customer support",
        areaServed: "ES",
        availableLanguage: ["Spanish", "Catalan", "English"],
      },
    ],
  };

  const localBusiness = {
    "@type": "FoodEstablishment",
    "@id": `${SITE.url}#localbusiness`,
    name: SITE.name,
    image: `${SITE.url}/og-image.jpg`,
    url: SITE.url,
    telephone: SITE.phone,
    email: SITE.email,
    priceRange: SITE.priceRange,
    servesCuisine: ["Halal"],
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      postalCode: SITE.address.postalCode,
      addressLocality: SITE.address.locality,
      addressRegion: SITE.address.region,
      addressCountry: SITE.address.country,
    },
    areaServed: [
      { "@type": "City", name: "Barcelona" },
      { "@type": "AdministrativeArea", name: "Àrea Metropolitana de Barcelona" },
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "09:00",
        closes: "20:00",
      },
    ],
    sameAs,
  };

  const website = {
    "@type": "WebSite",
    "@id": `${SITE.url}#website`,
    url: SITE.url,
    name: SITE.name,
    inLanguage: ["es-ES", "ca-ES", "en-US"],
    publisher: { "@id": `${SITE.url}#organization` },
  };

  const webPage = {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: t.meta.title,
    description: t.meta.description,
    inLanguage: langCode[lang],
    isPartOf: { "@id": `${SITE.url}#website` },
    about: { "@id": `${SITE.url}#localbusiness` },
  };

  const softwareApplication = {
    "@type": "MobileApplication",
    "@id": `${SITE.url}#app`,
    name: SITE.name,
    operatingSystem: "iOS, ANDROID",
    applicationCategory: "FoodApplication",
    inLanguage: ["es-ES", "ca-ES", "en-US"],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
    },
    downloadUrl: [SITE.app.appStore, SITE.app.playStore],
    publisher: { "@id": `${SITE.url}#organization` },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "37",
      bestRating: "5",
      worstRating: "1",
    },
  };

  const faqPage = {
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    inLanguage: langCode[lang],
    mainEntity: t.faq.items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumb = {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: SITE.name,
        item: url,
      },
    ],
  };

  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      organization,
      localBusiness,
      website,
      webPage,
      softwareApplication,
      faqPage,
      breadcrumb,
    ],
  });
}
