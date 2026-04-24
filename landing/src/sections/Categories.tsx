import { Container } from "../components/Container";
import { useT } from "../i18n";

const emojis = ["🥩", "🍖", "🍗", "🥩", "🌭", "🌶️"];

export function Categories() {
  const t = useT();
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            {t.categories.heading}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            {t.categories.intro}
          </p>
        </div>

        <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {t.categories.items.map((c, i) => (
            <li
              key={c.name}
              className="group flex flex-col items-start gap-2 rounded-2xl bg-gradient-to-br from-surface to-muted p-5 ring-1 ring-border transition-all hover:-translate-y-1 hover:shadow-lg hover:ring-primary/20"
            >
              <span
                aria-hidden="true"
                className="text-3xl transition-transform group-hover:scale-110"
              >
                {emojis[i] ?? "🥩"}
              </span>
              <h3 className="text-base font-semibold text-foreground">
                {c.name}
              </h3>
              <p className="text-xs text-muted-foreground leading-snug">
                {c.description}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
