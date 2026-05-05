import { useEffect, useMemo, useRef, useState } from "react";
import { Volume2, VolumeX, ArrowUpToLine, RefreshCw } from "lucide-react";
import { api } from "../lib/api";
import { formatCurrency } from "../lib/utils";
import LiveOrderCard, { type LiveOrder } from "../components/LiveOrderCard";
import OrderDetailModal from "../components/OrderDetailModal";
import { useSseEvent } from "../contexts/SseContext";

const ACTIVE_STATUSES = ["pending", "confirmed", "preparing", "shipped"] as const;
type ActiveStatus = (typeof ACTIVE_STATUSES)[number];

const STATUS_LABEL: Record<ActiveStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  preparing: "Preparando",
  shipped: "Enviado",
};

const FRESH_MS = 1500;
const SOUND_KEY = "live_orders_sound";
const AUTOSCROLL_KEY = "live_orders_autoscroll";

function playChime() {
  // Synthesised chime via WebAudio so we don't ship a binary asset.
  try {
    const Ctx =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    [880, 1320].forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, now + i * 0.12);
      g.gain.exponentialRampToValueAtTime(0.18, now + i * 0.12 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 0.4);
      o.connect(g).connect(ctx.destination);
      o.start(now + i * 0.12);
      o.stop(now + i * 0.12 + 0.45);
    });
    setTimeout(() => ctx.close().catch(() => {}), 800);
  } catch {
    // ignore
  }
}

export default function LiveOrdersPage() {
  const [orders, setOrders] = useState<LiveOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ActiveStatus | "all">("all");
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(
    () => localStorage.getItem(SOUND_KEY) === "1",
  );
  const [autoScroll, setAutoScroll] = useState(
    () => localStorage.getItem(AUTOSCROLL_KEY) !== "0",
  );

  const listRef = useRef<HTMLDivElement | null>(null);
  const freshTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const load = () => {
    setLoading(true);
    api.get<LiveOrder[]>("/admin/orders/active").then((r) => {
      if (r.success) setOrders((r.data as LiveOrder[]) || []);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
    return () => {
      freshTimers.current.forEach((t) => clearTimeout(t));
      freshTimers.current.clear();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(SOUND_KEY, soundOn ? "1" : "0");
  }, [soundOn]);
  useEffect(() => {
    localStorage.setItem(AUTOSCROLL_KEY, autoScroll ? "1" : "0");
  }, [autoScroll]);

  const markFresh = (id: string) => {
    const existing = freshTimers.current.get(id);
    if (existing) clearTimeout(existing);
    const t = setTimeout(() => {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, isFresh: false } : o)),
      );
      freshTimers.current.delete(id);
    }, FRESH_MS);
    freshTimers.current.set(id, t);
  };

  useSseEvent("new_order", (data) => {
    const incoming: LiveOrder = {
      id: data.id,
      order_number: data.order_number ?? null,
      status: data.status ?? "pending",
      payment_method: data.payment_method ?? null,
      payment_status: data.payment_status ?? null,
      total: data.total,
      first_name: data.first_name ?? null,
      last_name: data.last_name ?? null,
      items_count: data.items_count ?? null,
      created_at: data.at ?? new Date().toISOString(),
      isFresh: true,
    };
    setOrders((prev) => {
      if (prev.some((o) => o.id === incoming.id)) return prev;
      return [incoming, ...prev];
    });
    markFresh(incoming.id);
    if (soundOn) playChime();
    if (autoScroll && listRef.current) {
      listRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  useSseEvent("order_status_changed", (data) => {
    setOrders((prev) => {
      const idx = prev.findIndex((o) => o.id === data.id);
      if (idx === -1) return prev;
      const next = [...prev];
      // Drop the order from the active list when it leaves active statuses.
      if (
        !ACTIVE_STATUSES.includes(data.status as ActiveStatus) &&
        data.status !== "delivered" // already excluded but explicit
      ) {
        next.splice(idx, 1);
        return next;
      }
      if (
        data.status === "delivered" ||
        data.status === "cancelled" ||
        data.status === "refunded"
      ) {
        next.splice(idx, 1);
        return next;
      }
      next[idx] = { ...next[idx], status: data.status, isFresh: true };
      return next;
    });
    markFresh(data.id);
  });

  const advance = async (id: string, next: string) => {
    setBusyIds((s) => new Set(s).add(id));
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: next } : o)),
    );
    const r = await api.patch(`/admin/orders/${id}/status`, { status: next });
    setBusyIds((s) => {
      const n = new Set(s);
      n.delete(id);
      return n;
    });
    if (!r.success) {
      // Revert: refetch full list
      load();
    }
  };

  const cancel = async (id: string) => {
    if (!confirm("¿Cancelar este pedido?")) return;
    setBusyIds((s) => new Set(s).add(id));
    const r = await api.patch(`/admin/orders/${id}/status`, {
      status: "cancelled",
    });
    setBusyIds((s) => {
      const n = new Set(s);
      n.delete(id);
      return n;
    });
    if (r.success) {
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } else {
      load();
    }
  };

  const filtered = useMemo(
    () => (filter === "all" ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter],
  );

  const stats = useMemo(() => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const lastHour = orders.filter(
      (o) => new Date(o.created_at).getTime() >= oneHourAgo,
    );
    const revenue = lastHour.reduce(
      (sum, o) => sum + (typeof o.total === "string" ? parseFloat(o.total) : o.total),
      0,
    );
    const counts: Record<string, number> = {};
    for (const o of orders) counts[o.status] = (counts[o.status] || 0) + 1;
    return {
      lastHourCount: lastHour.length,
      lastHourRevenue: revenue,
      counts,
    };
  }, [orders]);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold">Pedidos en vivo</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Los nuevos pedidos aparecen aquí en tiempo real.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundOn((s) => !s)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              soundOn
                ? "bg-orange-50 border-orange-200 text-orange-700"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
            title="Sonido al recibir pedido"
          >
            {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
            {soundOn ? "Sonido" : "Silencio"}
          </button>
          <button
            onClick={() => setAutoScroll((s) => !s)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              autoScroll
                ? "bg-orange-50 border-orange-200 text-orange-700"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
            title="Desplazar al inicio en cada pedido"
          >
            <ArrowUpToLine size={14} />
            Auto
          </button>
          <button
            onClick={load}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            <RefreshCw size={14} />
            Recargar
          </button>
        </div>
      </div>

      {/* Mini KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Últ. hora</p>
          <p className="text-xl font-bold mt-1">{stats.lastHourCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">pedidos</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Ingresos últ. hora</p>
          <p className="text-xl font-bold mt-1 tabular-nums">
            {formatCurrency(stats.lastHourRevenue)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Pendientes</p>
          <p className="text-xl font-bold mt-1 text-yellow-700">
            {stats.counts.pending ?? 0}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">En preparación</p>
          <p className="text-xl font-bold mt-1 text-orange-700">
            {stats.counts.preparing ?? 0}
          </p>
        </div>
      </div>

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
            filter === "all"
              ? "bg-gray-900 text-white border-gray-900"
              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          Todos · {orders.length}
        </button>
        {ACTIVE_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              filter === s
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {STATUS_LABEL[s]} · {stats.counts[s] ?? 0}
          </button>
        ))}
      </div>

      <div ref={listRef} className="space-y-2">
        {loading && (
          <div className="text-center py-12 text-gray-500 text-sm">
            Cargando…
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-sm">
              No hay pedidos {filter === "all" ? "activos" : `en "${STATUS_LABEL[filter as ActiveStatus]}"`}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Esta página se actualiza automáticamente.
            </p>
          </div>
        )}
        {filtered.map((o) => (
          <LiveOrderCard
            key={o.id}
            order={o}
            onOpen={() => setSelectedOrderId(o.id)}
            onAdvance={(next) => advance(o.id, next)}
            onCancel={() => cancel(o.id)}
            busy={busyIds.has(o.id)}
          />
        ))}
      </div>

      <OrderDetailModal
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        onStatusChange={load}
      />
    </div>
  );
}
