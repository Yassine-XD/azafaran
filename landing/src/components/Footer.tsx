import { Mail, Phone, MapPin, Instagram, Facebook } from "lucide-react";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useT, useLang } from "../i18n";
import { SITE, langPath } from "../seo/constants";

export function Footer() {
  const t = useT();
  const lang = useLang();
  const base = langPath(lang);

  return (
    <footer className="mt-24 border-t border-border bg-muted/40">
      <Container as="div" className="py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="max-w-sm text-sm text-muted-foreground">
              {t.footer.tagline}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={SITE.social.instagram}
                target="_blank"
                rel="noopener"
                aria-label="Instagram"
                className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-border text-muted-foreground hover:text-foreground hover:ring-primary/40 transition-colors"
              >
                <Instagram className="h-5 w-5" aria-hidden="true" />
              </a>
              <a
                href={SITE.social.facebook}
                target="_blank"
                rel="noopener"
                aria-label="Facebook"
                className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-border text-muted-foreground hover:text-foreground hover:ring-primary/40 transition-colors"
              >
                <Facebook className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">
              {t.footer.product}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#product" className="hover:text-foreground">
                  {t.nav.product}
                </a>
              </li>
              <li>
                <a href="#how" className="hover:text-foreground">
                  {t.nav.how}
                </a>
              </li>
              <li>
                <a href="#coverage" className="hover:text-foreground">
                  {t.nav.coverage}
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-foreground">
                  {t.nav.faq}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">
              {t.footer.legal}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href={`${base}privacy`} className="hover:text-foreground">
                  {t.footer.privacy}
                </a>
              </li>
              <li>
                <a href={`${base}terms`} className="hover:text-foreground">
                  {t.footer.terms}
                </a>
              </li>
              <li>
                <a href={`${base}privacy#cookies`} className="hover:text-foreground">
                  {t.footer.cookies}
                </a>
              </li>
            </ul>
          </div>

          <address className="not-italic">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              {t.footer.contact}
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
                <a
                  href={`mailto:${SITE.email}`}
                  className="hover:text-foreground break-all"
                >
                  {SITE.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
                <a
                  href={`tel:${SITE.phone}`}
                  className="hover:text-foreground"
                >
                  {SITE.phoneDisplay}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                <span>
                  {SITE.address.street}
                  <br />
                  {SITE.address.postalCode} {SITE.address.locality}
                  <br />
                  {SITE.address.region}, España
                </span>
              </li>
            </ul>
          </address>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {SITE.legalName}. {t.footer.rights}
            <span className="mx-2">·</span>
            {t.footer.madeIn}
          </p>
          <LanguageSwitcher />
        </div>
      </Container>
    </footer>
  );
}
