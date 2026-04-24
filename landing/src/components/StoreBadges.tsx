import { Apple, Smartphone } from "lucide-react";
import { useT } from "../i18n";
import { SITE } from "../seo/constants";

interface Props {
  size?: "md" | "lg";
  className?: string;
  align?: "start" | "center";
}

export function StoreBadges({
  size = "md",
  className = "",
  align = "start",
}: Props) {
  const t = useT();
  const dims =
    size === "lg"
      ? "h-16 px-6 text-base"
      : "h-14 px-5 text-sm";
  const justify = align === "center" ? "justify-center" : "justify-start";

  return (
    <div className={`flex flex-wrap gap-3 ${justify} ${className}`}>
      <a
        href={SITE.app.appStore}
        target="_blank"
        rel="noopener"
        aria-label={t.download.appStoreAlt}
        className={`group inline-flex items-center gap-3 rounded-2xl bg-foreground text-background shadow-lg shadow-foreground/20 transition-all hover:-translate-y-0.5 hover:shadow-xl ${dims}`}
      >
        <Apple className="h-7 w-7 shrink-0" aria-hidden="true" />
        <span className="flex flex-col leading-tight">
          <span className="text-[0.65rem] uppercase tracking-wider opacity-80">
            {size === "lg" ? "Download on the" : "Disponible en"}
          </span>
          <span className="font-semibold tracking-tight">App Store</span>
        </span>
      </a>
      <a
        href={SITE.app.playStore}
        target="_blank"
        rel="noopener"
        aria-label={t.download.playStoreAlt}
        className={`group inline-flex items-center gap-3 rounded-2xl bg-foreground text-background shadow-lg shadow-foreground/20 transition-all hover:-translate-y-0.5 hover:shadow-xl ${dims}`}
      >
        <Smartphone className="h-7 w-7 shrink-0" aria-hidden="true" />
        <span className="flex flex-col leading-tight">
          <span className="text-[0.65rem] uppercase tracking-wider opacity-80">
            {size === "lg" ? "Get it on" : "Disponible en"}
          </span>
          <span className="font-semibold tracking-tight">Google Play</span>
        </span>
      </a>
    </div>
  );
}
