import { Head } from "vite-react-ssg";
import { useT, useLang } from "../i18n";
import { LANGS, SITE, langUrl, type Lang } from "./constants";
import { buildJsonLd } from "./jsonld";

const ogLocale: Record<Lang, string> = {
  es: "es_ES",
  ca: "ca_ES",
  en: "en_US",
};

export function Seo() {
  const lang = useLang();
  const t = useT();
  const canonical = langUrl(lang);

  return (
    <Head>
      <html lang={lang} />
      <title>{t.meta.title}</title>
      <meta name="description" content={t.meta.description} />
      <meta name="keywords" content={t.meta.keywords} />
      <meta name="author" content={SITE.name} />
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta
        name="googlebot"
        content="index, follow, max-snippet:-1, max-image-preview:large"
      />

      <link rel="canonical" href={canonical} />
      {LANGS.map((l) => (
        <link
          key={l}
          rel="alternate"
          hrefLang={l}
          href={langUrl(l)}
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={SITE.url} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:title" content={t.meta.ogTitle} />
      <meta property="og:description" content={t.meta.ogDescription} />
      <meta property="og:url" content={canonical} />
      <meta property="og:locale" content={ogLocale[lang]} />
      {LANGS.filter((l) => l !== lang).map((l) => (
        <meta key={l} property="og:locale:alternate" content={ogLocale[l]} />
      ))}
      <meta property="og:image" content={`${SITE.url}/og-image.jpg`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={t.meta.ogTitle} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={t.meta.ogTitle} />
      <meta name="twitter:description" content={t.meta.ogDescription} />
      <meta name="twitter:image" content={`${SITE.url}/og-image.jpg`} />

      <meta name="apple-mobile-web-app-title" content={SITE.name} />
      <meta name="application-name" content={SITE.name} />
    </Head>
  );
}

export function JsonLd() {
  const lang = useLang();
  const t = useT();
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: buildJsonLd(lang, t) }}
    />
  );
}
