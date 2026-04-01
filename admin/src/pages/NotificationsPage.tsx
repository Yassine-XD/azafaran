import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import { formatDateTime, truncate } from "../lib/utils";
import DataTable, { type Column } from "../components/DataTable";
import Modal from "../components/Modal";
import FormField, { inputClass, selectClass, btnPrimary, btnSecondary } from "../components/FormField";
import { Plus, Send } from "lucide-react";

type Campaign = {
  id: string; title: string; body: string; type: string;
  target: string; deep_link: string; image_url: string;
  scheduled_at: string; created_at: string;
};

const empty = { title: "", body: "", type: "push", target: "all", deep_link: "", image_url: "", scheduled_at: "" };

export default function NotificationsPage() {
  const [data, setData] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get(`/admin/notifications/campaigns?page=${page}&limit=20`).then((r) => {
      if (r.success) { setData(r.data as any || []); setTotalPages(r.meta?.total_pages || 1); }
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, [page]);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = { ...form, scheduled_at: form.scheduled_at || undefined };
    await api.post("/admin/notifications/send", body);
    setSaving(false);
    setModal(false);
    setForm(empty);
    load();
  };

  const cols: Column<Campaign>[] = [
    { key: "title", header: "Título" },
    { key: "body", header: "Mensaje", render: (r) => truncate(r.body || "", 50) },
    { key: "type", header: "Tipo" },
    { key: "target", header: "Destino" },
    { key: "scheduled_at", header: "Programado", render: (r) => r.scheduled_at ? formatDateTime(r.scheduled_at) : "Inmediato" },
    { key: "created_at", header: "Creado", render: (r) => formatDateTime(r.created_at) },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Notificaciones</h2>
        <button onClick={() => { setForm(empty); setModal(true); }} className={`${btnPrimary} flex items-center gap-1`}><Plus size={16} /> Nueva campaña</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200">
        <DataTable columns={cols} data={data} loading={loading} page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Enviar notificación">
        <form onSubmit={send} className="space-y-4">
          <FormField label="Título"><input className={inputClass} required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></FormField>
          <FormField label="Mensaje"><textarea className={inputClass} rows={4} required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Tipo">
              <select className={selectClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="push">Push</option><option value="email">Email</option><option value="sms">SMS</option>
              </select>
            </FormField>
            <FormField label="Destino">
              <select className={selectClass} value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })}>
                <option value="all">Todos</option><option value="segment">Segmento</option>
              </select>
            </FormField>
          </div>
          <FormField label="Deep link (opcional)"><input className={inputClass} value={form.deep_link} onChange={(e) => setForm({ ...form, deep_link: e.target.value })} placeholder="/products/xxx" /></FormField>
          <FormField label="URL imagen (opcional)"><input className={inputClass} value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></FormField>
          <FormField label="Programar envío (opcional)"><input type="datetime-local" className={inputClass} value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} /></FormField>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModal(false)} className={btnSecondary}>Cancelar</button>
            <button type="submit" disabled={saving} className={`${btnPrimary} flex items-center gap-1`}><Send size={14} /> {saving ? "Enviando..." : "Enviar"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
