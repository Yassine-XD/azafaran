import { ShoppingBag, CreditCard, Banknote, Package, ChevronRight } from "lucide-react";
import { formatCurrency, formatRelativeTime } from "../lib/utils";
import StatusBadge from "./StatusBadge";

export type LiveOrder = {
  id: string;
  order_number?: string | null;
  status: string;
  payment_method?: string | null;
  payment_status?: string | null;
  total: number | string;
  first_name?: string | null;
  last_name?: string | null;
  items_count?: number | null;
  created_at: string;
  isFresh?: boolean;
};

const NEXT_STATUS: Record<string, { next: string; label: string }> = {
  pending: { next: "confirmed", label: "Confirmar" },
  confirmed: { next: "preparing", label: "Preparar" },
  preparing: { next: "shipped", label: "Enviar" },
  shipped: { next: "delivered", label: "Entregar" },
};

const PAYMENT_ICON: Record<string, typeof CreditCard> = {
  card: CreditCard,
  cash: Banknote,
  bizum: CreditCard,
};

type Props = {
  order: LiveOrder;
  onOpen: () => void;
  onAdvance?: (next: string) => void;
  onCancel?: () => void;
  busy?: boolean;
};

export default function LiveOrderCard({
  order,
  onOpen,
  onAdvance,
  onCancel,
  busy,
}: Props) {
  const next = NEXT_STATUS[order.status];
  const PayIcon = PAYMENT_ICON[order.payment_method ?? ""] ?? CreditCard;
  const total =
    typeof order.total === "string" ? parseFloat(order.total) : order.total;

  return (
    <div
      className={`bg-white rounded-xl border transition-all ${
        order.isFresh
          ? "border-orange-400 shadow-[0_0_0_4px_rgba(251,146,60,0.18)]"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="p-4 flex flex-wrap items-start gap-4">
        <button
          onClick={onOpen}
          className="flex-1 min-w-0 text-left flex items-start gap-3"
        >
          <div className="bg-orange-50 text-orange-600 rounded-xl p-2.5 flex-shrink-0">
            <ShoppingBag size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">
                {order.order_number ?? order.id.slice(0, 8).toUpperCase()}
              </span>
              <StatusBadge status={order.status} />
              {order.payment_status && order.payment_status !== "paid" && (
                <StatusBadge status={order.payment_status} />
              )}
              <span className="text-xs text-gray-500">
                · {formatRelativeTime(order.created_at)}
              </span>
            </div>
            <div className="text-sm text-gray-700 mt-1 truncate">
              {order.first_name || order.last_name
                ? `${order.first_name ?? ""} ${order.last_name ?? ""}`.trim()
                : "Cliente"}
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1">
                <PayIcon size={12} />
                {order.payment_method ?? "—"}
              </span>
              {order.items_count != null && (
                <span className="inline-flex items-center gap-1">
                  <Package size={12} />
                  {order.items_count}{" "}
                  {order.items_count === 1 ? "artículo" : "artículos"}
                </span>
              )}
            </div>
          </div>
        </button>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className="text-lg font-bold tabular-nums">
            {formatCurrency(total)}
          </span>
          <div className="flex items-center gap-2">
            {onCancel && order.status === "pending" && (
              <button
                onClick={onCancel}
                disabled={busy}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
            )}
            {next && onAdvance && (
              <button
                onClick={() => onAdvance(next.next)}
                disabled={busy}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50"
              >
                {next.label}
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
