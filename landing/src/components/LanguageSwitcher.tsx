import { Globe } from "lucide-react";
import { useLang } from "../i18n";
import { LANGS, LANG_SHORT, langPath } from "../seo/constants";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const current = useLang();
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full bg-muted p-1 ring-1 ring-border ${className}`}
      role="group"
      aria-label="Language"
    >
      <Globe
        className="ml-2 h-4 w-4 text-muted-foreground"
        aria-hidden="true"
      />
      {LANGS.map((l) => {
        const active = l === current;
        return (
          <a
            key={l}
            href={langPath(l)}
            hrefLang={l}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {LANG_SHORT[l]}
          </a>
        );
      })}
    </div>
  );
}
