import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import { formatDate } from "../lib/utils";
import DataTable, { type Column } from "../components/DataTable";
import Modal from "../components/Modal";
import FormField, { inputClass, selectClass, btnPrimary, btnSecondary } from "../components/FormField";
import StatusBadge from "../components/StatusBadge";
import { Plus, Pencil, Trash2 } from "lucide-react";

type Promotion = {
  id: string; title: string; subtitle: string; type: string; scope: string;
  product_id: string; category_id: string; discount_type: string; discount_value: string;
  image_url: string; badge_text: string; show_on_home: boolean; show_on_product: boolean;
  priority: number; is_active: boolean; starts_at: string; ends_at: string;
};

const empty = {
  title: "", subtitle: "", type: "deal", scope: "all", product_id: "", category_id: "",
  discount_type: "percentage", discount_value: "", image_url: "", badge_text: "",
  show_on_home: true, show_on_product: true, priority: "0", starts_at: "", ends_at: "",
};

export default function PromotionsPage() {
  const [data, setData] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get(`/admin/promotions?page=${page}&limit=20`).then((r) => {
      if (r.success) { setData(r.data as any || []); setTotalPages(r.meta?.total_pages || 1); }
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, [page]);

  const openCreate = () => { setEditing(null); setForm(empty); setModal(true); };
  const openEdit = (p: Promotion) => {
    setEditing(p);
    setForm({
      title: p.title, subtitle: p.subtitle || "", type: p.type, scope: p.scope,
      product_id: p.product_id || "", category_id: p.category_id || "",
      discount_type: p.discount_type, discount_value: p.discount_value,
      image_url: p.image_url || "", badge_text: p.badge_text || "",
      show_on_home: p.show_on_home, show_on_product: p.show_on_product,
      priority: String(p.priority), starts_at: p.starts_at?.slice(0, 16) || "", ends_at: p.ends_at?.slice(0, 16) || "",
    });
    setModal(true);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = { ...form, discount_value: Number(form.discount_value), priority: Number(form.priority) };
    const res = editing
      ? await api.put(`/admin/promotions/${editing.id}`, body)
      : await api.post("/admin/promotions", body);
    setSaving(false);
    if (res.success) { setModal(false); load(); }
  };

  const del = async (id: string) => {
    if (!confirm("¿Eliminar esta promoción?")) return;
    await api.del(`/admin/promotions/${id}`);
    load();
  };

  const cols: Column<Promotion>[] = [
    { key: "title", header: "Título" },
    { key: "type", header: "Tipo" },
    { key: "scope", header: "Alcance" },
    { key: "discount_value", header: "Descuento", render: (r) => `${r.discount_value}${r.discount_type === "percentage" ? "%" : "€"}` },
    { key: "priority", header: "Prioridad" },
    { key: "is_active", header: "Estado", render: (r) => <StatusBadge status={r.is_active ? "active" : "inactive"} /> },
    { key: "starts_at", header: "Inicio", render: (r) => r.starts_at ? formatDate(r.starts_at) : "—" },
    { key: "ends_at", header: "Fin", render: (r) => r.ends_at ? formatDate(r.ends_at) : "—" },
    {
      key: "actions", header: "", render: (r) => (
        <div className="flex gap-1">
          <button onClick={(e) => { e.stopPropagation(); openEdit(r); }} className="p-1.5 hover:bg-gray-100 rounded text-gray-600"><Pencil size={15} /></button>
          <button onClick={(e) => { e.stopPropagation(); del(r.id); }} className="p-1.5 hover:bg-gray-100 rounded text-red-600"><Trash2 size={15} /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Promociones</h2>
        <button onClick={openCreate} className={`${btnPrimary} flex items-center gap-1`}><Plus size={16} /> Añadir</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200">
        <DataTable columns={cols} data={data} loading={loading} page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Editar promoción" : "Nueva promoción"} wide>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Título"><input className={inputClass} required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></FormField>
            <FormField label="Subtítulo"><input className={inputClass} value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} /></FormField>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Tipo">
              <select className={selectClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="deal">Deal</option><option value="bundle">Bundle</option><option value="flash_sale">Flash Sale</option>
              </select>
            </FormField>
            <FormField label="Alcance">
              <select className={selectClass} value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })}>
                <option value="all">Todos</option><option value="product">Producto</option><option value="category">Categoría</option>
              </select>
            </FormField>
            <FormField label="Prioridad"><input type="number" className={inputClass} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} /></FormField>
          </div>
          {form.scope === "product" && <FormField label="Product ID"><input className={inputClass} value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })} /></FormField>}
          {form.scope === "category" && <FormField label="Category ID"><input className={inputClass} value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} /></FormField>}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Tipo descuento">
              <select className={selectClass} value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })}>
                <option value="percentage">Porcentaje</option><option value="fixed">Fijo (€)</option>
              </select>
            </FormField>
            <FormField label="Valor descuento"><input type="number" step="0.01" className={inputClass} required value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="URL imagen"><input className={inputClass} value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></FormField>
            <FormField label="Badge"><input className={inputClass} value={form.badge_text} onChange={(e) => setForm({ ...form, badge_text: e.target.value })} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Inicio"><input type="datetime-local" className={inputClass} value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} /></FormField>
            <FormField label="Fin"><input type="datetime-local" className={inputClass} value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} /></FormField>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.show_on_home} onChange={(e) => setForm({ ...form, show_on_home: e.target.checked })} /> Mostrar en inicio</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.show_on_product} onChange={(e) => setForm({ ...form, show_on_product: e.target.checked })} /> Mostrar en producto</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModal(false)} className={btnSecondary}>Cancelar</button>
            <button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Guardando..." : "Guardar"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
