export interface Faq {
  q: string;
  a: string;
}

export interface Step {
  title: string;
  body: string;
}

export interface Feature {
  title: string;
  body: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  city: string;
}

export interface Dict {
  meta: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
    keywords: string;
  };
  nav: {
    product: string;
    how: string;
    coverage: string;
    faq: string;
    download: string;
    skipToContent: string;
  };
  hero: {
    eyebrow: string;
    h1: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    rating: string;
    badge: string;
  };
  trust: {
    halal: string;
    delivery: string;
    freeShipping: string;
    payment: string;
  };
  features: {
    heading: string;
    intro: string;
    items: Feature[];
  };
  how: {
    heading: string;
    intro: string;
    steps: Step[];
  };
  categories: {
    heading: string;
    intro: string;
    items: { name: string; description: string }[];
  };
  coverage: {
    heading: string;
    intro: string;
    description: string;
    cities: string[];
    note: string;
  };
  testimonials: {
    heading: string;
    intro: string;
    items: Testimonial[];
  };
  download: {
    heading: string;
    intro: string;
    appStore: string;
    playStore: string;
    appStoreAlt: string;
    playStoreAlt: string;
  };
  faq: {
    heading: string;
    intro: string;
    items: Faq[];
  };
  finalCta: {
    heading: string;
    body: string;
    button: string;
  };
  footer: {
    tagline: string;
    product: string;
    company: string;
    legal: string;
    contact: string;
    privacy: string;
    terms: string;
    cookies: string;
    rights: string;
    madeIn: string;
    languageLabel: string;
  };
  language: string;
}
