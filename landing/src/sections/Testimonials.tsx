import { Quote, Star } from "lucide-react";
import { Container } from "../components/Container";
import { useT } from "../i18n";

export function Testimonials() {
  const t = useT();
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            {t.testimonials.heading}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            {t.testimonials.intro}
          </p>
        </div>

        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {t.testimonials.items.map((it) => (
            <li
              key={it.author}
              className="relative flex flex-col rounded-3xl bg-surface p-7 ring-1 ring-border"
            >
              <Quote
                className="absolute right-6 top-6 h-8 w-8 text-accent/40"
                aria-hidden="true"
              />
              <div className="flex gap-1" aria-label="5 out of 5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-accent text-accent"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-foreground leading-relaxed">
                "{it.quote}"
              </blockquote>
              <footer className="mt-5 text-sm">
                <p className="font-semibold text-foreground">{it.author}</p>
                <p className="text-muted-foreground">{it.city}</p>
              </footer>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
