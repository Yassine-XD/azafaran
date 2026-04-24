import { Download } from "lucide-react";
import { Container } from "../components/Container";
import { LinkButton } from "../components/Button";
import { useT } from "../i18n";
import { SITE } from "../seo/constants";

export function FinalCta() {
  const t = useT();
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="flex flex-col items-center gap-6 rounded-3xl bg-surface p-8 sm:p-12 text-center ring-1 ring-border shadow-md">
          <h2 className="max-w-2xl text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {t.finalCta.heading}
          </h2>
          <p className="max-w-xl text-muted-foreground leading-relaxed">
            {t.finalCta.body}
          </p>
          <LinkButton
            variant="primary"
            size="lg"
            href={SITE.app.appStore}
            target="_blank"
            rel="noopener"
          >
            <Download className="h-5 w-5" aria-hidden="true" />
            {t.finalCta.button}
          </LinkButton>
        </div>
      </Container>
    </section>
  );
}
