import { ChevronDown } from "lucide-react";
import type { Faq } from "../i18n/types";

export function FaqAccordion({ items }: { items: Faq[] }) {
  return (
    <div className="divide-y divide-border rounded-2xl bg-surface ring-1 ring-border">
      {items.map((item, i) => (
        <details key={i} className="group p-5 sm:p-6">
          <summary className="flex items-start justify-between gap-4 text-left">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              {item.q}
            </h3>
            <ChevronDown
              className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-muted-foreground">
            {item.a}
          </p>
        </details>
      ))}
    </div>
  );
}
