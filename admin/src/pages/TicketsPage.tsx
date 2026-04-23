import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { formatDateTime, truncate } from "../lib/utils";
import DataTable, { type Column } from "../components/DataTable";
import { inputClass, selectClass } from "../components/FormField";
import { Search, Circle } from "lucide-react";

type Ticket = {
  id: string;
  ticket_number: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  last_message_at: string;
  unread_for_admin: boolean;
  last_message: string | null;
  user_first_name: string;
  user_last_name: string;
  user_email: string;
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-orange-100 text-orange-700",
  in_progress: "bg-blue-100 text-blue-700",
  waiting_user: "bg-amber-100 text-amber-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-600",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  normal: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  open: "Abierto",
  in_progress: "En curso",
  waiting_user: "Esperando",
  resolved: "Resuelto",
  closed: "Cerrado",
};

const CATEGORY_LABELS: Record<string, string> = {
  order: "Pedido",
  payment: "Pago",
  delivery: "Entrega",
  product: "Producto",
  account: "Cuenta",
  other: "Otro",
};

export default function TicketsPage() {
  const nav = useNavigate();
  const [data, setData] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [q, setQ] = useState("");
  const [qInput, setQInput] = useState("");

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: "20",
    });
    if (status) params.set("status", status);
    if (category) params.set("category", category);
    if (priority) params.set("priority", priority);
    if (q) params.set("q", q);

    api.get(`/admin/tickets?${params.toString()}`).then((r) => {
      if (r.success) {
        setData((r.data as Ticket[]) || []);
        setTotalPages(r.meta?.total_pages || 1);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, category, priority, q]);

  const cols: Column<Ticket>[] = [
    {
      key: "ticket_number",
      header: "#",
      render: (r) => (
        <div className="flex items-center gap-2 font-mono text-xs text-gray-700">
          {r.unread_for_admin && (
            <Circle size={8} className="fill-orange-500 text-orange-500" />
          )}
          {r.ticket_number}
        </div>
      ),
    },
    {
      key: "subject",
      header: "Asunto",
      render: (r) => (
        <div>
          <div
            className={`${
              r.unread_for_admin ? "font-semibold" : ""
            } text-gray-900`}
          >
            {truncate(r.subject, 60)}
          </div>
          <div className="text-xs text-gray-500">
            {truncate(r.last_message || "", 70)}
          </div>
        </div>
      ),
    },
    {
      key: "user",
      header: "Usuario",
      render: (r) => (
        <div>
          <div className="text-gray-900">
            {r.user_first_name} {r.user_last_name}
          </div>
          <div className="text-xs text-gray-500">{r.user_email}</div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Categoría",
      render: (r) => (
        <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
          {CATEGORY_LABELS[r.category] || r.category}
        </span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (r) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
            STATUS_COLORS[r.status] || "bg-gray-100 text-gray-700"
          }`}
        >
          {STATUS_LABELS[r.status] || r.status}
        </span>
      ),
    },
    {
      key: "priority",
      header: "Prioridad",
      render: (r) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
            PRIORITY_COLORS[r.priority] || "bg-gray-100 text-gray-700"
          }`}
        >
          {r.priority}
        </span>
      ),
    },
    {
      key: "last_message_at",
      header: "Última actividad",
      render: (r) => formatDateTime(r.last_message_at),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Soporte — Tickets</h2>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            className={`${inputClass} pl-9`}
            placeholder="Buscar asunto / nº"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setPage(1);
                setQ(qInput);
              }
            }}
            onBlur={() => {
              if (q !== qInput) {
                setPage(1);
                setQ(qInput);
              }
            }}
          />
        </div>

        <select
          className={selectClass}
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="">Todos los estados</option>
          <option value="open">Abierto</option>
          <option value="in_progress">En curso</option>
          <option value="waiting_user">Esperando</option>
          <option value="resolved">Resuelto</option>
          <option value="closed">Cerrado</option>
        </select>

        <select
          className={selectClass}
          value={category}
          onChange={(e) => {
            setPage(1);
            setCategory(e.target.value);
          }}
        >
          <option value="">Todas las categorías</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          value={priority}
          onChange={(e) => {
            setPage(1);
            setPriority(e.target.value);
          }}
        >
          <option value="">Todas las prioridades</option>
          <option value="low">Baja</option>
          <option value="normal">Normal</option>
          <option value="high">Alta</option>
          <option value="urgent">Urgente</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <DataTable
          columns={cols}
          data={data}
          loading={loading}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          onRowClick={(r) => nav(`/tickets/${r.id}`)}
        />
      </div>
    </div>
  );
}
