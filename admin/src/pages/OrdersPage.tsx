import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { formatCurrency, formatDate } from "../lib/utils";
import DataTable, { type Column } from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import OrderDetailModal from "../components/OrderDetailModal";
import { selectClass, inputClass } from "../components/FormField";

type Order = {
  id: string; first_name: string; last_name: string; email: string;
  total: string; status: string; created_at: string;
};

const STATUSES = ["pending", "confirmed", "preparing", "shipped", "delivered", "cancelled"];

export default function OrdersPage() {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    let q = `/admin/orders?page=${page}&limit=20`;
    if (statusFilter) q += `&status=${statusFilter}`;
    if (dateFrom) q += `&dateFrom=${dateFrom}`;
    if (dateTo) q += `&dateTo=${dateTo}`;
    api.get(q).then((r) => {
      if (r.success) { setData(r.data as any || []); setTotalPages(r.meta?.total_pages || 1); }
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, [page, statusFilter, dateFrom, dateTo]);

  const cols: Column<Order>[] = [
    { key: "id", header: "ID", render: (r) => r.id.slice(0, 8).toUpperCase() + "..." },
    { key: "customer", header: "Cliente", render: (r) => `${r.first_name} ${r.last_name}` },
    { key: "email", header: "Email" },
    { key: "total", header: "Total", render: (r) => formatCurrency(Number(r.total)) },
    { key: "status", header: "Estado", render: (r) => <StatusBadge status={r.status} /> },
    { key: "created_at", header: "Fecha", render: (r) => formatDate(r.created_at) },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Pedidos</h2>
      <div className="flex flex-wrap gap-3 mb-4">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className={`${selectClass} max-w-xs`}>
          <option value="">Todos los estados</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className={`${inputClass} max-w-xs`} />
        <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className={`${inputClass} max-w-xs`} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200">
        <DataTable
          columns={cols}
          data={data}
          loading={loading}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
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
