import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { formatDate, formatCurrency } from "../lib/utils";
import StatusBadge from "../components/StatusBadge";
import { btnSecondary } from "../components/FormField";
import { ArrowLeft, Loader2 } from "lucide-react";

type UserDetail = {
  id: string; first_name: string; last_name: string; email: string;
  phone: string; role: string; is_active: boolean; is_verified: boolean;
  family_size: number; preferred_lang: string; created_at: string;
  recent_orders: { id: string; total_amount: string; status: string; created_at: string }[];
};

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/admin/users/${id}`).then((r) => {
      if (r.success) setUser(r.data as any);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-400" size={32} /></div>;
  if (!user) return <p className="text-gray-500 text-center py-20">Usuario no encontrado</p>;

  return (
    <div>
      <button onClick={() => navigate("/users")} className={`${btnSecondary} flex items-center gap-1 mb-4`}><ArrowLeft size={16} /> Volver</button>
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">{user.first_name} {user.last_name}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div><span className="text-gray-500">Email:</span> {user.email}</div>
          <div><span className="text-gray-500">Teléfono:</span> {user.phone || "—"}</div>
          <div><span className="text-gray-500">Rol:</span> {user.role}</div>
          <div><span className="text-gray-500">Activo:</span> <StatusBadge status={user.is_active ? "active" : "inactive"} /></div>
          <div><span className="text-gray-500">Verificado:</span> <StatusBadge status={user.is_verified ? "active" : "inactive"} /></div>
          <div><span className="text-gray-500">Tamaño familia:</span> {user.family_size || "—"}</div>
          <div><span className="text-gray-500">Idioma:</span> {user.preferred_lang || "—"}</div>
          <div><span className="text-gray-500">Registro:</span> {formatDate(user.created_at)}</div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-4 py-3 border-b"><h3 className="font-semibold">Pedidos recientes</h3></div>
        {user.recent_orders?.length ? (
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-gray-50"><th className="text-left px-4 py-2">ID</th><th className="text-left px-4 py-2">Total</th><th className="text-left px-4 py-2">Estado</th><th className="text-left px-4 py-2">Fecha</th></tr></thead>
            <tbody>
              {user.recent_orders.map((o) => (
                <tr key={o.id} className="border-b">
                  <td className="px-4 py-2">{o.id.slice(0, 8)}...</td>
                  <td className="px-4 py-2">{formatCurrency(Number(o.total_amount))}</td>
                  <td className="px-4 py-2"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-2">{formatDate(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-400 text-center py-8">Sin pedidos</p>
        )}
      </div>
    </div>
  );
}
