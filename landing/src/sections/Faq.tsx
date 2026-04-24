import { Container } from "../components/Container";
import { FaqAccordion } from "../components/FaqAccordion";
import { useT } from "../i18n";

export function Faq() {
  const t = useT();
  return (
    <section
      id="faq"
      className="py-20 sm:py-28 bg-gradient-to-b from-muted/40 to-background"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <p className="text-sm font-semibold text-primary uppercase tracking-wider">
              {t.nav.faq}
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              {t.faq.heading}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              {t.faq.intro}
            </p>
          </div>

          <FaqAccordion items={t.faq.items} />
        </div>
      </Container>
    </section>
  );
}
