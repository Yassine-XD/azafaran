import { Beef, Truck, BadgePercent } from "lucide-react";
import { Container } from "../components/Container";
import { useT } from "../i18n";

const icons = [Beef, Truck, BadgePercent];

export function Features() {
  const t = useT();
  return (
    <section id="product" className="py-20 sm:py-28">
      <Container>
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider">
            {t.nav.product}
          </p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            {t.features.heading}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            {t.features.intro}
          </p>
        </div>

        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {t.features.items.map((f, i) => {
            const Icon = icons[i] ?? Beef;
            return (
              <li
                key={f.title}
                className="group rounded-3xl bg-surface p-7 ring-1 ring-border transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:ring-primary/20"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-xl font-semibold text-foreground">
                  {f.title}
                </h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  {f.body}
                </p>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
