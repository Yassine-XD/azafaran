import { ShieldCheck, Truck, Wallet, Lock } from "lucide-react";
import { Container } from "../components/Container";
import { useT } from "../i18n";

export function TrustStrip() {
  const t = useT();
  const items = [
    { icon: ShieldCheck, label: t.trust.halal },
    { icon: Truck, label: t.trust.delivery },
    { icon: Wallet, label: t.trust.freeShipping },
    { icon: Lock, label: t.trust.payment },
  ];

  return (
    <section
      aria-label="Trust"
      className="border-y border-border bg-surface/70 backdrop-blur"
    >
      <Container className="py-5">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-6">
          {items.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-2.5 text-sm font-medium text-foreground"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent-soft text-accent-foreground">
                <Icon className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
