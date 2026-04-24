import { useEffect, useState } from "react";
import { Download, Menu, X } from "lucide-react";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useT } from "../i18n";
import { SITE } from "../seo/constants";

export function Header() {
  const t = useT();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#product", label: t.nav.product },
    { href: "#how", label: t.nav.how },
    { href: "#coverage", label: t.nav.coverage },
    { href: "#faq", label: t.nav.faq },
  ];

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-background/85 backdrop-blur-md shadow-sm"
          : "bg-background/0"
      }`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded focus:bg-foreground focus:px-3 focus:py-2 focus:text-background"
      >
        {t.nav.skipToContent}
      </a>
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground"
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher className="hidden sm:inline-flex" />
          <a
            href={SITE.app.appStore}
            target="_blank"
            rel="noopener"
            className="hidden md:inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary-hover transition-colors"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {t.nav.download}
          </a>
          <button
            type="button"
            className="md:hidden grid h-10 w-10 place-items-center rounded-full ring-1 ring-border text-foreground"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </Container>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <Container className="py-4 flex flex-col gap-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2 text-base font-medium text-foreground hover:bg-muted"
              >
                {l.label}
              </a>
            ))}
            <a
              href={SITE.app.appStore}
              target="_blank"
              rel="noopener"
              className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              {t.nav.download}
            </a>
            <LanguageSwitcher className="self-start" />
          </Container>
        </div>
      )}
    </header>
  );
}
