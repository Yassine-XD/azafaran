import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import DataTable, { type Column } from "../components/DataTable";
import Modal from "../components/Modal";
import FormField, { inputClass, btnPrimary, btnSecondary } from "../components/FormField";
import { Plus } from "lucide-react";

type Slot = {
  id: string; date: string; max_orders: number; booked_count: number;
};

export default function DeliverySlotsPage() {
  const [data, setData] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ date_from: "", date_to: "", max_orders: "10" });

  const load = () => {
    setLoading(true);
    api.get(`/admin/delivery-slots?page=${page}&limit=50`).then((r) => {
      if (r.success) { setData(r.data as any || []); setTotalPages(r.meta?.total_pages || 1); }
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, [page]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const slots: { date: string; start_time: string; end_time: string; max_orders: number }[] = [];
    const start = new Date(form.date_from);
    const end = new Date(form.date_to);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      slots.push({
        date: d.toISOString().split("T")[0],
        start_time: "09:00",
        end_time: "20:00",
        max_orders: Number(form.max_orders),
      });
    }
    if (slots.length === 0) { setSaving(false); return; }
    await api.post("/admin/delivery-slots", { slots });
    setSaving(false);
    setModal(false);
    load();
  };

  const cols: Column<Slot>[] = [
    { key: "date", header: "Fecha", render: (r) => r.date?.slice(0, 10) },
    { key: "max_orders", header: "Máx. pedidos" },
    { key: "booked_count", header: "Reservados" },
    {
      key: "fill", header: "Ocupación", render: (r) => {
        const pct = r.max_orders ? Math.round((r.booked_count / r.max_orders) * 100) : 0;
        return (
          <div className="flex items-center gap-2">
            <div className="w-20 bg-gray-200 rounded-full h-2">
              <div className={`h-2 rounded-full ${pct > 80 ? "bg-red-500" : pct > 50 ? "bg-yellow-500" : "bg-green-500"}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-gray-500">{pct}%</span>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Fechas de entrega</h2>
        <button onClick={() => setModal(true)} className={`${btnPrimary} flex items-center gap-1`}><Plus size={16} /> Generar</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200">
        <DataTable columns={cols} data={data} loading={loading} page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Generar fechas de entrega">
        <form onSubmit={save} className="space-y-4">
          <p className="text-sm text-gray-500 mb-2">Se creará una fecha de entrega por cada día en el rango seleccionado.</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Fecha inicio"><input type="date" className={inputClass} required value={form.date_from} onChange={(e) => setForm({ ...form, date_from: e.target.value })} /></FormField>
            <FormField label="Fecha fin"><input type="date" className={inputClass} required value={form.date_to} onChange={(e) => setForm({ ...form, date_to: e.target.value })} /></FormField>
          </div>
          <FormField label="Máx. pedidos por día"><input type="number" className={inputClass} required value={form.max_orders} onChange={(e) => setForm({ ...form, max_orders: e.target.value })} /></FormField>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModal(false)} className={btnSecondary}>Cancelar</button>
            <button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Generando..." : "Generar"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
