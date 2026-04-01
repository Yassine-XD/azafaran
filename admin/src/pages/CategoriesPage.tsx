import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import { slugify } from "../lib/utils";
import DataTable, { type Column } from "../components/DataTable";
import Modal from "../components/Modal";
import FormField, { inputClass, btnPrimary, btnSecondary } from "../components/FormField";
import StatusBadge from "../components/StatusBadge";
import { Plus, Pencil, Trash2 } from "lucide-react";

type Category = {
  id: string; name: string; slug: string; description: string;
  image_url: string; display_order: number; is_active: boolean;
};

const empty = { name: "", slug: "", description: "", image_url: "", display_order: "0" };

export default function CategoriesPage() {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get(`/admin/categories?page=${page}&limit=20`).then((r) => {
      if (r.success) { setData(r.data as any || []); setTotalPages(r.meta?.total_pages || 1); }
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, [page]);

  const openCreate = () => { setEditing(null); setForm(empty); setModal(true); };
  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({ name: c.name, slug: c.slug, description: c.description || "", image_url: c.image_url || "", display_order: String(c.display_order) });
    setModal(true);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = { ...form, display_order: Number(form.display_order) };
    const res = editing
      ? await api.put(`/admin/categories/${editing.id}`, body)
      : await api.post("/admin/categories", body);
    setSaving(false);
    if (res.success) { setModal(false); load(); }
  };

  const del = async (id: string) => {
    if (!confirm("¿Eliminar esta categoría?")) return;
    await api.del(`/admin/categories/${id}`);
    load();
  };

  const cols: Column<Category>[] = [
    { key: "name", header: "Nombre" },
    { key: "slug", header: "Slug" },
    { key: "display_order", header: "Orden" },
    { key: "is_active", header: "Estado", render: (r) => <StatusBadge status={r.is_active ? "active" : "inactive"} /> },
    {
      key: "image_url", header: "Imagen", render: (r) => r.image_url
        ? <img src={r.image_url} alt="" className="w-10 h-10 rounded object-cover" />
        : <span className="text-gray-400 text-xs">Sin imagen</span>,
    },
    {
      key: "actions", header: "Acciones", render: (r) => (
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
        <h2 className="text-xl font-bold">Categorías</h2>
        <button onClick={openCreate} className={`${btnPrimary} flex items-center gap-1`}><Plus size={16} /> Añadir</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200">
        <DataTable columns={cols} data={data} loading={loading} page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Editar categoría" : "Nueva categoría"}>
        <form onSubmit={save} className="space-y-4">
          <FormField label="Nombre">
            <input className={inputClass} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })} />
          </FormField>
          <FormField label="Slug">
            <input className={inputClass} required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </FormField>
          <FormField label="Descripción">
            <textarea className={inputClass} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </FormField>
          <FormField label="URL de imagen">
            <input className={inputClass} value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
          </FormField>
          <FormField label="Orden de visualización">
            <input type="number" className={inputClass} value={form.display_order} onChange={(e) => setForm({ ...form, display_order: e.target.value })} />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModal(false)} className={btnSecondary}>Cancelar</button>
            <button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Guardando..." : "Guardar"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
