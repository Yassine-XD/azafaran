import type { Request } from 'express';

const VALID_LANGS = ['es', 'ca', 'en'];

/** Extract language from X-Lang request header, defaulting to 'es'. */
export function getLang(req: Request): string {
  const lang = req.headers['x-lang'] as string;
  return VALID_LANGS.includes(lang) ? lang : 'es';
}

/** Resolve a translated string from a JSONB map, falling back gracefully. */
export function resolveI18n(
  i18n: Record<string, string> | null | undefined,
  fallback: string,
  lang: string,
): string {
  if (!i18n) return fallback ?? '';
  return i18n[lang] || i18n['es'] || fallback || '';
}
