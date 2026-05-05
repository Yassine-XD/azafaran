import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  ShoppingCart,
  DollarSign,
  Clock,
  LifeBuoy,
  AlertTriangle,
  Truck,
  Activity,
  UserPlus,
  Package as PackageIcon,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "../lib/api";
import {
  formatCurrency,
  formatDate,
  formatPercentDelta,
  formatRelativeTime,
} from "../lib/utils";
import StatsCard from "../components/StatsCard";
import StatusBadge from "../components/StatusBadge";
import OrderDetailModal from "../components/OrderDetailModal";
import { useSse } from "../contexts/SseContext";

type Stats = {
  total_users: number;
  orders_today: number;
  total_revenue: number;
  pending_orders: number;
  open_tickets?: number;
  unread_tickets?: number;
  revenue_today: number;
  revenue_yesterday: number;
  aov_today: number;
  aov_7d_avg: number;
  new_customers_today: number;
  orders_yesterday: number;
  orders_same_weekday_last_week: number;
  active_orders: number;
  low_stock_variants: number;
  todays_slots: { booked: number; capacity: number };
  revenue_series_14d: { date: string; revenue: number; orders: number }[];
  orders_by_status_7d: { status: string; count: number }[];
  top_products_30d: {
    product_id: string;
    name: string;
    images: any;
    units: number;
    revenue: number;
  }[];
};

type Order = {
  id: string;
  first_name: string;
  last_name: string;
  total: string;
  status: string;
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "#eab308",
  confirmed: "#3b82f6",
  preparing: "#f97316",
  shipped: "#a855f7",
  delivered: "#22c55e",
  cancelled: "#ef4444",
  refunded: "#9ca3af",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  preparing: "Preparando",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

function ShortDay({ date }: { date: string }) {
  const d = new Date(date);
  return (
    <>
      {d.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
    </>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [topMode, setTopMode] = useState<"revenue" | "units">("revenue");
  const { recent } = useSse();

  const load = () => {
    Promise.all([
      api.get<Stats>("/admin/dashboard"),
      api.get<Order[]>("/admin/orders?limit=10&page=1"),
    ]).then(([s, o]) => {
      if (s.success) setStats(s.data!);
      if (o.success) setOrders(Array.isArray(o.data) ? o.data : []);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
    const iv = setInterval(load, 60_000);
    return () => clearInterval(iv);
  }, []);

  const revenueDelta = useMemo(
    () =>
      stats
        ? formatPercentDelta(stats.revenue_today, stats.revenue_yesterday)
        : null,
    [stats],
  );
  const ordersDelta = useMemo(
    () =>
      stats
        ? formatPercentDelta(
            stats.orders_today,
            stats.orders_same_weekday_last_week,
          )
        : null,
    [stats],
  );
  const aovDelta = useMemo(
    () =>
      stats ? formatPercentDelta(stats.aov_today, stats.aov_7d_avg) : null,
    [stats],
  );

  const chartData = useMemo(
    () =>
      (stats?.revenue_series_14d ?? []).map((d) => ({
        ...d,
        label: new Date(d.date).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
        }),
      })),
    [stats],
  );

  const statusPieData = useMemo(
    () =>
      (stats?.orders_by_status_7d ?? [])
        .filter((s) => s.count > 0)
        .map((s) => ({
          ...s,
          label: STATUS_LABELS[s.status] ?? s.status,
        })),
    [stats],
  );

  const topProducts = useMemo(() => {
    const list = [...(stats?.top_products_30d ?? [])];
    list.sort((a, b) =>
      topMode === "revenue" ? b.revenue - a.revenue : b.units - a.units,
    );
    return list;
  }, [stats, topMode]);

  const slotPct = stats?.todays_slots.capacity
    ? Math.min(
        100,
        Math.round(
          (stats.todays_slots.booked / stats.todays_slots.capacity) * 100,
        ),
      )
    : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Dashboard</h2>
        {stats && (
          <span className="text-xs text-gray-500">
            Actualizado · {new Date().toLocaleTimeString("es-ES")}
          </span>
        )}
      </div>

      {/* Live activity strip */}
      {recent.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-3 mb-6 overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={14} className="text-orange-500" />
            <span className="text-xs font-semibold text-gray-700">
              Actividad reciente
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {recent.slice(0, 6).map((e, i) => (
              <div
                key={`${e.receivedAt}-${i}`}
                className="flex-shrink-0 px-3 py-1.5 bg-gray-50 rounded-lg text-xs text-gray-600 border border-gray-100"
              >
                <span className="font-medium text-gray-800">
                  {e.event === "new_order"
                    ? `Pedido €${e.data.total ?? "—"}`
                    : e.event === "order_status_changed"
                    ? `Estado → ${STATUS_LABELS[e.data.status] ?? e.data.status}`
                    : e.event === "new_ticket"
                    ? `Ticket ${e.data.ticket_number ?? ""}`
                    : e.event}
                </span>
                <span className="text-gray-400 ml-1.5">
                  {formatRelativeTime(e.receivedAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats && (
        <>
          {/* Zone A — Today */}
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Hoy
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Ingresos hoy"
              value={formatCurrency(stats.revenue_today)}
              icon={DollarSign}
              color="bg-green-500"
              delta={revenueDelta ?? undefined}
              subtitle="vs ayer"
            />
            <StatsCard
              title="Pedidos hoy"
              value={stats.orders_today}
              icon={ShoppingCart}
              color="bg-orange-500"
              delta={ordersDelta ?? undefined}
              subtitle="vs mismo día sem. pasada"
            />
            <StatsCard
              title="Ticket medio"
              value={formatCurrency(stats.aov_today)}
              icon={TrendingUp}
              color="bg-indigo-500"
              delta={aovDelta ?? undefined}
              subtitle="vs media 7 d"
            />
            <StatsCard
              title="Nuevos clientes"
              value={stats.new_customers_today}
              icon={UserPlus}
              color="bg-sky-500"
              subtitle="primer pedido hoy"
            />
          </div>

          {/* Zone B — Operations */}
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Operaciones
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Link to="/orders/live" className="block">
              <StatsCard
                title="Pedidos activos"
                value={stats.active_orders}
                icon={Clock}
                color="bg-yellow-500"
                subtitle="ver en vivo →"
              />
            </Link>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-sm text-gray-500">Franjas hoy</p>
                  <p className="text-2xl font-bold mt-1 tabular-nums">
                    {stats.todays_slots.booked}
                    <span className="text-base text-gray-400 font-medium">
                      {" "}
                      / {stats.todays_slots.capacity}
                    </span>
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-500 flex-shrink-0">
                  <Truck size={22} className="text-white" />
                </div>
              </div>
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    slotPct >= 90
                      ? "bg-red-500"
                      : slotPct >= 70
                      ? "bg-orange-500"
                      : "bg-purple-500"
                  }`}
                  style={{ width: `${slotPct}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                {slotPct}% ocupación
              </p>
            </div>
            <Link to="/products" className="block">
              <StatsCard
                title="Stock bajo"
                value={stats.low_stock_variants}
                icon={AlertTriangle}
                color="bg-red-500"
                subtitle="≤ 5 unidades"
              />
            </Link>
            <Link to="/tickets" className="block">
              <StatsCard
                title={`Tickets abiertos${
                  stats.unread_tickets
                    ? ` · ${stats.unread_tickets} sin leer`
                    : ""
                }`}
                value={stats.open_tickets ?? 0}
                icon={LifeBuoy}
                color="bg-rose-500"
              />
            </Link>
          </div>

          {/* Zone C — Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Ingresos · últimos 14 días</h3>
                <span className="text-xs text-gray-500">
                  Total: {formatCurrency(
                    chartData.reduce((s, d) => s + d.revenue, 0),
                  )}
                </span>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                    <XAxis
                      dataKey="label"
                      stroke="#9ca3af"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      interval={1}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `€${v}`}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(249, 115, 22, 0.06)" }}
                      formatter={(v: any) => [formatCurrency(v), "Ingresos"]}
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                      {chartData.map((d, i) => (
                        <Cell
                          key={i}
                          fill={
                            i === chartData.length - 1 ? "#f97316" : "#fdba74"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold mb-4">Estado de pedidos · 7 d</h3>
              {statusPieData.length > 0 ? (
                <div className="h-56 flex items-center">
                  <ResponsiveContainer width="50%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusPieData}
                        dataKey="count"
                        nameKey="label"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                      >
                        {statusPieData.map((s) => (
                          <Cell
                            key={s.status}
                            fill={STATUS_COLORS[s.status] ?? "#9ca3af"}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v: any) => [v, "Pedidos"]}
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid #e5e7eb",
                          fontSize: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <ul className="flex-1 space-y-1.5 text-xs">
                    {statusPieData.map((s) => (
                      <li
                        key={s.status}
                        className="flex items-center justify-between gap-2"
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor:
                                STATUS_COLORS[s.status] ?? "#9ca3af",
                            }}
                          />
                          {s.label}
                        </span>
                        <span className="font-semibold tabular-nums">
                          {s.count}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="h-56 flex items-center justify-center text-sm text-gray-400">
                  Sin pedidos en los últimos 7 días
                </div>
              )}
            </div>
          </div>

          {/* Zone D — Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold">Top productos · 30 d</h3>
                <div className="flex items-center gap-1 text-xs">
                  <button
                    onClick={() => setTopMode("revenue")}
                    className={`px-2 py-1 rounded ${
                      topMode === "revenue"
                        ? "bg-gray-900 text-white"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    Ingresos
                  </button>
                  <button
                    onClick={() => setTopMode("units")}
                    className={`px-2 py-1 rounded ${
                      topMode === "units"
                        ? "bg-gray-900 text-white"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    Unidades
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {topProducts.length === 0 && (
                  <div className="px-4 py-10 text-center text-sm text-gray-400">
                    Sin datos
                  </div>
                )}
                {topProducts.map((p, i) => {
                  const max =
                    topMode === "revenue"
                      ? topProducts[0]?.revenue || 1
                      : topProducts[0]?.units || 1;
                  const cur = topMode === "revenue" ? p.revenue : p.units;
                  const pct = Math.round((cur / max) * 100);
                  const img = Array.isArray(p.images)
                    ? typeof p.images[0] === "string"
                      ? p.images[0]
                      : p.images[0]?.url
                    : null;
                  return (
                    <div
                      key={p.product_id}
                      className="px-4 py-3 flex items-center gap-3"
                    >
                      <span className="text-xs font-bold text-gray-400 w-4">
                        {i + 1}
                      </span>
                      {img ? (
                        <img
                          src={img}
                          alt=""
                          className="w-9 h-9 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <PackageIcon size={14} className="text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <div className="h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-orange-500 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-semibold tabular-nums whitespace-nowrap">
                        {topMode === "revenue"
                          ? formatCurrency(p.revenue)
                          : `${p.units} u.`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold">Pedidos recientes</h3>
                <Link
                  to="/orders"
                  className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                >
                  Ver todos →
                </Link>
              </div>
              <div className="divide-y divide-gray-100">
                {loading && orders.length === 0 && (
                  <div className="px-4 py-10 text-center text-sm text-gray-400">
                    Cargando…
                  </div>
                )}
                {orders.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setSelectedOrderId(o.id)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 text-left"
                  >
                    <Users size={16} className="text-gray-300 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {o.first_name} {o.last_name}
                        </span>
                        <StatusBadge status={o.status} />
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        <ShortDay date={o.created_at} /> · {formatDate(o.created_at)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums whitespace-nowrap">
                      {formatCurrency(Number(o.total))}
                    </span>
                  </button>
                ))}
                {!loading && orders.length === 0 && (
                  <div className="px-4 py-10 text-center text-sm text-gray-400">
                    Sin pedidos aún
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <OrderDetailModal
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        onStatusChange={load}
      />
    </div>
  );
}
