import { Container } from "../components/Container";
import { StoreBadges } from "../components/StoreBadges";
import { useT } from "../i18n";

export function DownloadCta() {
  const t = useT();
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-primary to-[#3a0408] p-8 sm:p-14 text-primary-foreground shadow-2xl shadow-primary/30">
          <div
            aria-hidden="true"
            className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-accent/30 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          />

          <div className="relative grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
                {t.download.heading}
              </h2>
              <p className="mt-4 max-w-xl text-base sm:text-lg text-primary-foreground/80 leading-relaxed">
                {t.download.intro}
              </p>
              <div className="mt-7">
                <StoreBadges size="lg" />
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute right-0 top-1/2 -translate-y-1/2">
                <div className="grid h-44 w-44 place-items-center rounded-[2rem] bg-white/10 backdrop-blur-sm ring-1 ring-white/15">
                  <div className="grid h-32 w-32 place-items-center rounded-3xl bg-accent text-accent-foreground shadow-xl">
                    <span className="text-5xl font-bold">A</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
