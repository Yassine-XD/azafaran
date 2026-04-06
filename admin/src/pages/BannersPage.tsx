import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import { formatDate } from "../lib/utils";
import DataTable, { type Column } from "../components/DataTable";
import Modal from "../components/Modal";
import FormField, { inputClass, btnPrimary, btnSecondary } from "../components/FormField";
import StatusBadge from "../components/StatusBadge";
import { Plus, Pencil, Trash2 } from "lucide-react";

type Banner = {
  id: string; title: string; subtitle: string; image_url: string;
  cta_text: string; cta_link: string; display_order: number;
  is_active: boolean; starts_at: string; ends_at: string;
};

const empty = { title: "", subtitle: "", image_url: "", cta_text: "", cta_link: "", display_order: "0", is_active: true, starts_at: "", ends_at: "" };

export default function BannersPage() {
  const [data, setData] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get(`/admin/banners?page=${page}&limit=20`).then((r) => {
      if (r.success) { setData(r.data as any || []); setTotalPages(r.meta?.total_pages || 1); }
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, [page]);

  const openCreate = () => { setEditing(null); setForm(empty); setModal(true); };
  const openEdit = (b: Banner) => {
    setEditing(b);
    setForm({
      title: b.title, subtitle: b.subtitle || "", image_url: b.image_url || "",
      cta_text: b.cta_text || "", cta_link: b.cta_link || "",
      display_order: String(b.display_order), is_active: b.is_active, starts_at: b.starts_at?.slice(0, 16) || "", ends_at: b.ends_at?.slice(0, 16) || "",
    });
    setModal(true);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = { ...form, display_order: Number(form.display_order) };
    const res = editing
      ? await api.put(`/admin/banners/${editing.id}`, body)
      : await api.post("/admin/banners", body);
    setSaving(false);
    if (res.success) { setModal(false); load(); }
  };

  const del = async (id: string) => {
    if (!confirm("¿Eliminar este banner?")) return;
    await api.del(`/admin/banners/${id}`);
    load();
  };

  const cols: Column<Banner>[] = [
    { key: "title", header: "Título" },
    { key: "subtitle", header: "Subtítulo" },
    {
      key: "image_url", header: "Imagen", render: (r) => r.image_url
        ? <img src={r.image_url} alt="" className="w-16 h-10 rounded object-cover" />
        : <span className="text-gray-400 text-xs">—</span>,
    },
    { key: "display_order", header: "Orden" },
    { key: "is_active", header: "Estado", render: (r) => (
      <button
        onClick={async (e) => {
          e.stopPropagation();
          await api.put(`/admin/banners/${r.id}`, { is_active: !r.is_active });
          load();
        }}
        className={`px-2 py-0.5 rounded text-xs font-medium ${
          r.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {r.is_active ? "Activo" : "Inactivo"}
      </button>
    ) },
    { key: "starts_at", header: "Inicio", render: (r) => r.starts_at ? formatDate(r.starts_at) : "—" },
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
        <h2 className="text-xl font-bold">Banners</h2>
        <button onClick={openCreate} className={`${btnPrimary} flex items-center gap-1`}><Plus size={16} /> Añadir</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200">
        <DataTable columns={cols} data={data} loading={loading} page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Editar banner" : "Nuevo banner"}>
        <form onSubmit={save} className="space-y-4">
          <FormField label="Título"><input className={inputClass} required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></FormField>
          <FormField label="Subtítulo"><input className={inputClass} value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} /></FormField>
          <FormField label="URL imagen"><input className={inputClass} value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Texto CTA"><input className={inputClass} value={form.cta_text} onChange={(e) => setForm({ ...form, cta_text: e.target.value })} /></FormField>
            <FormField label="Enlace CTA"><input className={inputClass} value={form.cta_link} onChange={(e) => setForm({ ...form, cta_link: e.target.value })} /></FormField>
          </div>
          <FormField label="Orden"><input type="number" className={inputClass} value={form.display_order} onChange={(e) => setForm({ ...form, display_order: e.target.value })} /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Inicio"><input type="datetime-local" className={inputClass} value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} /></FormField>
            <FormField label="Fin"><input type="datetime-local" className={inputClass} value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} /></FormField>
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
