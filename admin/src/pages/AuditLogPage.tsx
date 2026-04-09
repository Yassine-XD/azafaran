import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { formatDateTime } from "../lib/utils";
import DataTable, { type Column } from "../components/DataTable";
import { inputClass, selectClass } from "../components/FormField";
import { ChevronDown, ChevronRight } from "lucide-react";

type AuditEntry = {
  id: string; admin_id: string; action: string; entity: string; entity_id: string;
  before: any; after: any; ip_address: string;
  first_name: string; last_name: string; email: string; created_at: string;
};

export default function AuditLogPage() {
  const [data, setData] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entityFilter, setEntityFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    let q = `/admin/audit-log?page=${page}&limit=50`;
    if (entityFilter) q += `&entity=${entityFilter}`;
    if (actionFilter) q += `&action=${actionFilter}`;
    api.get(q).then((r) => {
      if (r.success) { setData(r.data as any || []); setTotalPages(r.meta?.total_pages || 1); }
      setLoading(false);
    });
  }, [page, entityFilter, actionFilter]);

  const cols: Column<AuditEntry>[] = [
    { key: "created_at", header: "Fecha", render: (r) => formatDateTime(r.created_at) },
    { key: "admin", header: "Admin", render: (r) => `${r.first_name || ""} ${r.last_name || ""}`.trim() || r.email },
    { key: "action", header: "Acción" },
    { key: "entity", header: "Entidad" },
    { key: "entity_id", header: "ID", render: (r) => r.entity_id?.slice(0, 8) || "—" },
    {
      key: "details", header: "Detalles", render: (r) => (
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(expanded === r.id ? null : r.id); }}
          className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
        >
          {expanded === r.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          {expanded === r.id ? "Ocultar" : "Ver"}
        </button>
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Registro de auditoría</h2>
      <div className="flex gap-3 mb-4">
        <select value={entityFilter} onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }} className={`${selectClass} max-w-xs`}>
          <option value="">Todas las entidades</option>
          {["product", "product_variant", "pack_item", "category", "order", "user", "promotion", "banner", "promo_code", "delivery_slot", "notification_campaign"].map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
        <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }} className={`${selectClass} max-w-xs`}>
          <option value="">Todas las acciones</option>
          {["create", "update", "update_status", "delete", "bulk_create"].map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>
      <div className="bg-white rounded-xl border border-gray-200">
        <DataTable columns={cols} data={data} loading={loading} page={page} totalPages={totalPages} onPageChange={setPage} />
        {/* Expanded details */}
        {expanded && data.filter((d) => d.id === expanded).map((entry) => (
          <div key={entry.id} className="px-4 py-3 border-t bg-gray-50 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium mb-1">Antes:</p>
                <pre className="bg-white p-2 rounded border overflow-auto max-h-40">{entry.before ? JSON.stringify(entry.before, null, 2) : "—"}</pre>
              </div>
              <div>
                <p className="font-medium mb-1">Después:</p>
                <pre className="bg-white p-2 rounded border overflow-auto max-h-40">{entry.after ? JSON.stringify(entry.after, null, 2) : "—"}</pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
