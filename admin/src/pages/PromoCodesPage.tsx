import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import { formatDate, formatCurrency } from "../lib/utils";
import DataTable, { type Column } from "../components/DataTable";
import Modal from "../components/Modal";
import FormField, { inputClass, selectClass, btnPrimary, btnSecondary } from "../components/FormField";
import StatusBadge from "../components/StatusBadge";
import { Plus, Pencil, Trash2 } from "lucide-react";

type PromoCode = {
  id: string; code: string; type: string; value: string;
  min_order_amount: string; max_uses: number; max_uses_per_user: number;
  used_count: number; is_active: boolean; expires_at: string;
};

const empty = { code: "", type: "percentage", value: "", min_order_amount: "", max_uses: "", max_uses_per_user: "1", is_active: true, expires_at: "" };

export default function PromoCodesPage() {
  const [data, setData] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<PromoCode | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get(`/admin/promo-codes?page=${page}&limit=20`).then((r) => {
      if (r.success) { setData(r.data as any || []); setTotalPages(r.meta?.total_pages || 1); }
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, [page]);

  const openCreate = () => { setEditing(null); setForm(empty); setModal(true); };
  const openEdit = (p: PromoCode) => {
    setEditing(p);
    setForm({
      code: p.code, type: p.type, value: p.value,
      min_order_amount: p.min_order_amount || "", max_uses: String(p.max_uses || ""),
      max_uses_per_user: String(p.max_uses_per_user || "1"),
      is_active: p.is_active, expires_at: p.expires_at?.slice(0, 16) || "",
    });
    setModal(true);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      code: form.code, type: form.type, value: Number(form.value),
      min_order_amount: form.min_order_amount ? Number(form.min_order_amount) : undefined,
      max_uses: form.max_uses ? Number(form.max_uses) : undefined,
      max_uses_per_user: Number(form.max_uses_per_user),
      is_active: form.is_active,
      expires_at: form.expires_at || undefined,
    };
    const res = editing
      ? await api.put(`/admin/promo-codes/${editing.id}`, body)
      : await api.post("/admin/promo-codes", body);
    setSaving(false);
    if (res.success) { setModal(false); load(); }
  };

  const cols: Column<PromoCode>[] = [
    { key: "code", header: "Código", render: (r) => <span className="font-mono font-medium">{r.code}</span> },
    { key: "type", header: "Tipo" },
    { key: "value", header: "Valor", render: (r) => r.type === "percentage" ? `${r.value}%` : formatCurrency(Number(r.value)) },
    { key: "min_order_amount", header: "Mín. pedido", render: (r) => r.min_order_amount ? formatCurrency(Number(r.min_order_amount)) : "—" },
    { key: "max_uses", header: "Máx. usos", render: (r) => r.max_uses || "∞" },
    { key: "used_count", header: "Usados" },
    { key: "is_active", header: "Estado", render: (r) => (
      <button
        onClick={async (e) => {
          e.stopPropagation();
          await api.put(`/admin/promo-codes/${r.id}`, { is_active: !r.is_active });
          load();
        }}
        className={`px-2 py-0.5 rounded text-xs font-medium ${
          r.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {r.is_active ? "Activo" : "Inactivo"}
      </button>
    ) },
    { key: "expires_at", header: "Expira", render: (r) => r.expires_at ? formatDate(r.expires_at) : "—" },
    {
      key: "actions", header: "", render: (r) => (
        <div className="flex gap-1">
          <button onClick={(e) => { e.stopPropagation(); openEdit(r); }} className="p-1.5 hover:bg-gray-100 rounded text-gray-600"><Pencil size={15} /></button>
          <button onClick={async (e) => {
            e.stopPropagation();
            if (!confirm("¿Eliminar este código promocional?")) return;
            await api.del(`/admin/promo-codes/${r.id}`);
            load();
          }} className="p-1.5 hover:bg-gray-100 rounded text-red-600"><Trash2 size={15} /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Códigos promocionales</h2>
        <button onClick={openCreate} className={`${btnPrimary} flex items-center gap-1`}><Plus size={16} /> Añadir</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200">
        <DataTable columns={cols} data={data} loading={loading} page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Editar código" : "Nuevo código"}>
        <form onSubmit={save} className="space-y-4">
          <FormField label="Código"><input className={`${inputClass} uppercase font-mono`} required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="VERANO2024" /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Tipo">
              <select className={selectClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="percentage">Porcentaje</option><option value="fixed">Fijo (€)</option>
              </select>
            </FormField>
            <FormField label="Valor"><input type="number" step="0.01" className={inputClass} required value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Mín. pedido (€)"><input type="number" step="0.01" className={inputClass} value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })} /></FormField>
            <FormField label="Máx. usos total"><input type="number" className={inputClass} value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Máx. usos/usuario"><input type="number" className={inputClass} value={form.max_uses_per_user} onChange={(e) => setForm({ ...form, max_uses_per_user: e.target.value })} /></FormField>
            <FormField label="Expira"><input type="datetime-local" className={inputClass} value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} /></FormField>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            Activo
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModal(false)} className={btnSecondary}>Cancelar</button>
            <button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Guardando..." : "Guardar"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
