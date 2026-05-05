export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount);
}

export function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatDateTime(d: string): string {
  return new Date(d).toLocaleString("es-ES", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function truncate(text: string, len: number): string {
  return text.length > len ? text.slice(0, len) + "..." : text;
}

export function formatRelativeTime(d: string | number | Date): string {
  const date = typeof d === "string" || typeof d === "number" ? new Date(d) : d;
  const diffSec = Math.round((Date.now() - date.getTime()) / 1000);
  if (diffSec < 5) return "ahora";
  if (diffSec < 60) return `hace ${diffSec} s`;
  const m = Math.floor(diffSec / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const days = Math.floor(h / 24);
  if (days < 7) return `hace ${days} d`;
  return formatDate(date.toISOString());
}

export function formatPercentDelta(curr: number, prev: number): {
  text: string;
  positive: boolean;
  neutral: boolean;
} {
  if (!prev) {
    if (!curr) return { text: "0%", positive: false, neutral: true };
    return { text: "+∞", positive: true, neutral: false };
  }
  const pct = ((curr - prev) / prev) * 100;
  const rounded = Math.round(pct * 10) / 10;
  const sign = rounded > 0 ? "+" : "";
  return {
    text: `${sign}${rounded}%`,
    positive: rounded >= 0,
    neutral: rounded === 0,
  };
}
