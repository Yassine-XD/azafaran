import { MapPin, Mail } from "lucide-react";
import { Container } from "../components/Container";
import { useT } from "../i18n";
import { SITE } from "../seo/constants";

export function Coverage() {
  const t = useT();
  return (
    <section
      id="coverage"
      className="py-20 sm:py-28 bg-gradient-to-b from-background to-muted/40"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-primary uppercase tracking-wider">
              {t.nav.coverage}
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              {t.coverage.heading}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              {t.coverage.description}
            </p>
            <p className="mt-6 inline-flex items-start gap-2 rounded-2xl bg-accent-soft px-4 py-3 text-sm text-accent-foreground ring-1 ring-accent/40">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                {t.coverage.note.split(SITE.email)[0]}
                <a
                  href={`mailto:${SITE.email}`}
                  className="font-semibold underline"
                >
                  {SITE.email}
                </a>
                {t.coverage.note.split(SITE.email)[1]}
              </span>
            </p>
          </div>

          <div className="rounded-3xl bg-surface p-7 ring-1 ring-border shadow-lg shadow-primary/5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {t.coverage.intro}
            </h3>
            <ul className="mt-5 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
              {t.coverage.cities.map((city) => (
                <li
                  key={city}
                  className="flex items-center gap-2 text-sm text-foreground"
                >
                  <MapPin
                    className="h-3.5 w-3.5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  {city}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
