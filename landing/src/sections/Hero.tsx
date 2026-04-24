import { ArrowRight, ShieldCheck, Star } from "lucide-react";
import { Container } from "../components/Container";
import { StoreBadges } from "../components/StoreBadges";
import { useT } from "../i18n";

export function Hero() {
  const t = useT();
  return (
    <section
      id="main"
      className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-accent-soft blur-3xl opacity-70" />
        <div className="absolute top-20 -right-20 h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <Container className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent-foreground ring-1 ring-accent/40">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            {t.hero.eyebrow}
          </span>

          <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.05]">
            {t.hero.h1}
          </h1>

          <p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
            {t.hero.subtitle}
          </p>

          <div className="mt-8">
            <StoreBadges size="md" />
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Star
                  className="h-4 w-4 fill-accent text-accent"
                  aria-hidden="true"
                />
                <Star
                  className="h-4 w-4 fill-accent text-accent"
                  aria-hidden="true"
                />
                <Star
                  className="h-4 w-4 fill-accent text-accent"
                  aria-hidden="true"
                />
                <Star
                  className="h-4 w-4 fill-accent text-accent"
                  aria-hidden="true"
                />
                <Star
                  className="h-4 w-4 fill-accent text-accent"
                  aria-hidden="true"
                />
                <span className="ml-1">{t.hero.rating}</span>
              </span>
            </div>
            <a
              href="#how"
              className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all"
            >
              {t.hero.secondaryCta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <PhoneMockup badge={t.hero.badge} />
        </div>
      </Container>
    </section>
  );
}

function PhoneMockup({ badge }: { badge: string }) {
  return (
    <div className="relative mx-auto aspect-[9/18] w-[280px] sm:w-[320px] lg:w-[360px] animate-float">
      <div className="absolute inset-0 rounded-[2.5rem] bg-foreground p-2 shadow-2xl shadow-primary/30 ring-1 ring-foreground/40">
        <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-primary to-[#3a0408]">
          <div className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-foreground" />

          <div className="relative h-full p-5 pt-10 text-primary-foreground flex flex-col">
            <div className="flex items-center justify-between text-[10px] opacity-80">
              <span>9:41</span>
              <span>●●●● 5G</span>
            </div>

            <div className="mt-4">
              <p className="text-xs uppercase tracking-wider opacity-70">
                Azafaran
              </p>
              <h3 className="mt-1 text-2xl font-bold leading-tight">
                Carne halal fresca, hoy.
              </h3>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2">
              {[
                { name: "Cordero", emoji: "🥩" },
                { name: "Ternera", emoji: "🍖" },
                { name: "Pollo", emoji: "🍗" },
                { name: "Picada", emoji: "🥩" },
              ].map((c) => (
                <div
                  key={c.name}
                  className="rounded-xl bg-white/10 backdrop-blur-sm p-2.5 ring-1 ring-white/15"
                >
                  <div className="text-2xl">{c.emoji}</div>
                  <p className="mt-1 text-xs font-semibold">{c.name}</p>
                </div>
              ))}
            </div>

            <div className="mt-auto">
              <div className="rounded-xl bg-white/10 backdrop-blur-sm p-3 ring-1 ring-white/15">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] opacity-70">Pedido #1248</p>
                    <p className="text-sm font-semibold">En camino</p>
                  </div>
                  <span className="rounded-full bg-accent text-accent-foreground px-2.5 py-1 text-[10px] font-bold">
                    24 min
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                  <div className="h-full w-3/4 rounded-full bg-accent" />
                </div>
              </div>
              <button
                type="button"
                className="mt-3 w-full rounded-xl bg-white text-primary font-bold py-3 text-sm shadow-md"
              >
                Pedir ahora
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -right-4 top-10 rotate-6 rounded-full bg-accent text-accent-foreground px-3 py-1.5 text-xs font-bold shadow-lg ring-1 ring-accent/60">
        ✓ {badge}
      </div>
    </div>
  );
}
