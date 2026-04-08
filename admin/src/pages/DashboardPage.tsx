import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { formatCurrency, formatDate } from "../lib/utils";
import StatsCard from "../components/StatsCard";
import DataTable, { type Column } from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import OrderDetailModal from "../components/OrderDetailModal";
import { Users, ShoppingCart, DollarSign, Clock } from "lucide-react";

type Stats = { total_users: number; orders_today: number; total_revenue: number; pending_orders: number };
type Order = { id: string; first_name: string; last_name: string; total: string; status: string; created_at: string };

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

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

  useEffect(() => { load(); }, []);

  const cols: Column<Order>[] = [
    { key: "id", header: "Pedido", render: (r) => r.id.slice(0, 8).toUpperCase() + "..." },
    { key: "customer", header: "Cliente", render: (r) => `${r.first_name} ${r.last_name}` },
    { key: "total", header: "Total", render: (r) => formatCurrency(Number(r.total)) },
    { key: "status", header: "Estado", render: (r) => <StatusBadge status={r.status} /> },
    { key: "created_at", header: "Fecha", render: (r) => formatDate(r.created_at) },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Dashboard</h2>
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Usuarios" value={stats.total_users} icon={Users} color="bg-blue-500" />
          <StatsCard title="Pedidos hoy" value={stats.orders_today} icon={ShoppingCart} color="bg-orange-500" />
          <StatsCard title="Ingresos totales" value={formatCurrency(stats.total_revenue)} icon={DollarSign} color="bg-green-500" />
          <StatsCard title="Pendientes" value={stats.pending_orders} icon={Clock} color="bg-yellow-500" />
        </div>
      )}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold">Pedidos recientes</h3>
        </div>
        <DataTable
          columns={cols}
          data={orders}
          loading={loading}
          onRowClick={(row) => setSelectedOrderId(row.id)}
        />
      </div>

      <OrderDetailModal
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        onStatusChange={load}
      />
    </div>
  );
}
