import { Download, ShoppingBag, CreditCard, Home } from "lucide-react";
import { Container } from "../components/Container";
import { useT } from "../i18n";

const icons = [Download, ShoppingBag, CreditCard, Home];

export function HowItWorks() {
  const t = useT();
  return (
    <section
      id="how"
      className="relative overflow-hidden py-20 sm:py-28 bg-muted/40"
    >
      <Container>
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider">
            {t.nav.how}
          </p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            {t.how.heading}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            {t.how.intro}
          </p>
        </div>

        <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {t.how.steps.map((s, i) => {
            const Icon = icons[i] ?? Download;
            return (
              <li
                key={s.title}
                className="relative rounded-3xl bg-surface p-7 ring-1 ring-border"
              >
                <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-sm">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="mt-2 grid h-12 w-12 place-items-center rounded-2xl bg-accent-soft text-accent-foreground">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-foreground">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {s.body}
                </p>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
