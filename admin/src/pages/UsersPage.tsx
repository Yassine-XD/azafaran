import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { formatDate } from "../lib/utils";
import DataTable, { type Column } from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { inputClass } from "../components/FormField";
import { Eye } from "lucide-react";

type User = {
  id: string; first_name: string; last_name: string; email: string;
  phone: string; role: string; is_active: boolean; is_verified: boolean; created_at: string;
};

export default function UsersPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    let q = `/admin/users?page=${page}&limit=20`;
    if (search) q += `&search=${encodeURIComponent(search)}`;
    api.get(q).then((r) => {
      if (r.success) { setData(r.data as any || []); setTotalPages(r.meta?.total_pages || 1); }
      setLoading(false);
    });
  }, [page, search]);

  const cols: Column<User>[] = [
    { key: "name", header: "Nombre", render: (r) => `${r.first_name} ${r.last_name}` },
    { key: "email", header: "Email" },
    { key: "phone", header: "Teléfono" },
    { key: "role", header: "Rol" },
    { key: "is_active", header: "Activo", render: (r) => <StatusBadge status={r.is_active ? "active" : "inactive"} /> },
    { key: "is_verified", header: "Verificado", render: (r) => <StatusBadge status={r.is_verified ? "active" : "inactive"} /> },
    { key: "created_at", header: "Registro", render: (r) => formatDate(r.created_at) },
    {
      key: "actions", header: "", render: (r) => (
        <button onClick={() => navigate(`/users/${r.id}`)} className="p-1.5 hover:bg-gray-100 rounded text-blue-600"><Eye size={16} /></button>
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Usuarios</h2>
      <input
        type="text" placeholder="Buscar por nombre o email..." value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className={`${inputClass} max-w-sm mb-4`}
      />
      <div className="bg-white rounded-xl border border-gray-200">
        <DataTable columns={cols} data={data} loading={loading} page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
