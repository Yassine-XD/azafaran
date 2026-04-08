import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import { formatDate } from "../lib/utils";
import DataTable, { type Column } from "../components/DataTable";
import Modal from "../components/Modal";
import FormField, { inputClass, btnPrimary, btnSecondary } from "../components/FormField";
import { Plus, Pencil, Trash2 } from "lucide-react";

type Article = {
  id: string; title: string; subtitle: string; image_url: string;
  link_type: string; link_value: string; bg_color: string; content: string;
  display_order: number; is_active: boolean; starts_at: string; ends_at: string;
};

const LINK_TYPES = [
  { value: "", label: "— Ninguno —" },
  { value: "article", label: "Artículo (pantalla completa)" },
  { value: "internal", label: "Ruta interna" },
  { value: "external", label: "URL externa" },
  { value: "recipe", label: "Receta" },
];

const empty = {
  title: "", subtitle: "", image_url: "", link_type: "", link_value: "",
  bg_color: "", content: "", display_order: "0", is_active: true, starts_at: "", ends_at: "",
};

export default function BannersPage() {
  const [data, setData] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
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
  const openEdit = (a: Article) => {
    setEditing(a);
    setForm({
      title: a.title, subtitle: a.subtitle || "", image_url: a.image_url || "",
      link_type: a.link_type || "", link_value: a.link_value || "",
      bg_color: a.bg_color || "", content: a.content || "",
      display_order: String(a.display_order), is_active: a.is_active,
      starts_at: a.starts_at?.slice(0, 16) || "", ends_at: a.ends_at?.slice(0, 16) || "",
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
    if (!confirm("¿Eliminar este artículo?")) return;
    await api.del(`/admin/banners/${id}`);
    load();
  };

  const cols: Column<Article>[] = [
    { key: "title", header: "Título" },
    { key: "subtitle", header: "Subtítulo" },
    {
      key: "image_url", header: "Imagen", render: (r) => r.image_url
        ? <img src={r.image_url} alt="" className="w-16 h-10 rounded object-cover" />
        : <span className="text-gray-400 text-xs">—</span>,
    },
    {
      key: "link_type", header: "Tipo", render: (r) => r.link_type
        ? <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">{r.link_type}</span>
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
        <h2 className="text-xl font-bold">Artículos</h2>
        <button onClick={openCreate} className={`${btnPrimary} flex items-center gap-1`}><Plus size={16} /> Añadir</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200">
        <DataTable columns={cols} data={data} loading={loading} page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Editar artículo" : "Nuevo artículo"}>
        <form onSubmit={save} className="space-y-4">
          <FormField label="Título"><input className={inputClass} required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></FormField>
          <FormField label="Subtítulo"><input className={inputClass} value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} /></FormField>
          <FormField label="URL imagen"><input className={inputClass} value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Tipo de enlace">
              <select className={inputClass} value={form.link_type} onChange={(e) => setForm({ ...form, link_type: e.target.value })}>
                {LINK_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </FormField>
            <FormField label="Valor del enlace">
              <input
                className={inputClass}
                value={form.link_value}
                onChange={(e) => setForm({ ...form, link_value: e.target.value })}
                placeholder={form.link_type === "internal" ? "/shop" : form.link_type === "external" ? "https://..." : ""}
                disabled={!form.link_type || form.link_type === "article"}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Color de fondo">
              <div className="flex gap-2 items-center">
                <input type="color" className="h-9 w-14 rounded border border-gray-300 cursor-pointer p-0.5" value={form.bg_color || "#660710"} onChange={(e) => setForm({ ...form, bg_color: e.target.value })} />
                <input className={inputClass} value={form.bg_color} onChange={(e) => setForm({ ...form, bg_color: e.target.value })} placeholder="#660710" />
              </div>
            </FormField>
            <FormField label="Orden"><input type="number" className={inputClass} value={form.display_order} onChange={(e) => setForm({ ...form, display_order: e.target.value })} /></FormField>
          </div>
          <FormField label="Contenido del artículo">
            <textarea
              className={`${inputClass} min-h-32 resize-y`}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Escribe el contenido del artículo aquí..."
            />
          </FormField>
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
