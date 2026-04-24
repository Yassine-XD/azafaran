# Azafaran — Landing page

Marketing site for [www.azafaran.es](https://www.azafaran.es). Drives downloads of the Azafaran halal meat delivery mobile app.

## Stack

- Vite 6 · React 19 · TypeScript · Tailwind 4
- `vite-react-ssg` — pre-renders each route to static HTML (good for SEO and LLM crawlers)
- Trilingual: ES (`/`), CA (`/ca/`), EN (`/en/`) with hreflang alternates
- JSON-LD (`Organization`, `LocalBusiness`, `SoftwareApplication`, `FAQPage`, `WebSite`, `BreadcrumbList`)

## Scripts

```bash
npm install        # install deps
npm run dev        # local dev server (http://localhost:5173)
npm run build      # SSG build → dist/ with one index.html per route
npm run preview    # preview built output
npm run typecheck  # tsc only
```

## Deploy

The `dist/` folder is a fully static site. In production it is mounted into the nginx container at `/var/www/landing` (see `../deploy/docker-compose.prod.yml`) and served from the root `/`. The API is proxied to the backend under `/api/`.

## Structure

```
src/
├── main.tsx                # SSG entry
├── routes.tsx              # route table wrapped per language
├── index.css               # Tailwind + theme tokens
├── i18n/{es,ca,en,types,index}
├── seo/{constants,jsonld,Seo}
├── components/             # Logo, Header, Footer, Button, LanguageSwitcher, StoreBadges, FaqAccordion, Container
├── sections/               # Hero, TrustStrip, Features, HowItWorks, Categories, Coverage, Testimonials, DownloadCta, Faq, FinalCta
└── pages/                  # LandingPage, PrivacyPage, TermsPage, NotFoundPage
```

## SEO/GEO checklist

- Per-language `<title>`, `<meta name="description">`, Open Graph and Twitter cards
- `<link rel="alternate" hreflang>` between ES/CA/EN + `x-default`
- Semantic HTML5 with exactly one `<h1>` per page
- JSON-LD graph inlined in every page
- `public/sitemap.xml`, `public/robots.txt`, `public/llms.txt`
- Native `<details>` accordions (crawlable FAQ)

## Replace before launch

- `apps.apple.com/app/azafaran` and Play Store URL with the real published links (`src/seo/constants.ts`)
- `og-image.jpg` with branded 1200×630 social card
- Testimonials with real customer quotes (`src/i18n/*.ts`)
