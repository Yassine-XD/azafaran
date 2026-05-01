import { useEffect, useState, useRef, type FormEvent } from "react";
import { api } from "../lib/api";
import { formatDateTime, truncate } from "../lib/utils";
import DataTable, { type Column } from "../components/DataTable";
import Modal from "../components/Modal";
import FormField, { inputClass, selectClass, btnPrimary, btnSecondary } from "../components/FormField";
import { Plus, Send, X } from "lucide-react";

type Campaign = {
  id: string; title: string; body: string; type: string;
  target: string; deep_link: string; image_url: string;
  scheduled_at: string; created_at: string;
};

type Destination = "none" | "screen" | "product" | "coupon" | "survey";
type ScreenName = "index" | "categories" | "deals" | "orders" | "profile";

type FormState = {
  title: string;
  body: string;
  target: "all" | "segment";
  image_url: string;
  scheduled_at: string;
  destination: Destination;
  screen: ScreenName;
  productId: string;
  productLabel: string;
  promoCode: string;
  surveyId: string;
};

const empty: FormState = {
  title: "",
  body: "",
  target: "all",
  image_url: "",
  scheduled_at: "",
  destination: "none",
  screen: "deals",
  productId: "",
  productLabel: "",
  promoCode: "",
  surveyId: "",
};

type ProductHit = { id: string; name: string };
type SurveyOption = { id: string; title: string };

export default function NotificationsPage() {
  const [data, setData] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const [productQuery, setProductQuery] = useState("");
  const [productHits, setProductHits] = useState<ProductHit[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const productSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [surveyOptions, setSurveyOptions] = useState<SurveyOption[]>([]);

  const load = () => {
    setLoading(true);
    api.get<Campaign[]>(`/admin/notifications/campaigns?page=${page}&limit=20`).then((r) => {
      if (r.success) { setData((r.data as Campaign[]) || []); setTotalPages(r.meta?.total_pages || 1); }
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, [page]);

  // Debounced product search for the autocomplete picker.
  useEffect(() => {
    if (form.destination !== "product") return;
    if (productSearchTimer.current) clearTimeout(productSearchTimer.current);
    if (!productQuery.trim()) {
      setProductHits([]);
      return;
    }
    productSearchTimer.current = setTimeout(async () => {
      setProductLoading(true);
      const r = await api.get<{ id: string; name: string }[]>(
        `/admin/products?search=${encodeURIComponent(productQuery)}&limit=10`,
      );
      if (r.success) {
        const rows = (r.data as any[]) || [];
        setProductHits(rows.map((p) => ({ id: p.id, name: p.name })));
      }
      setProductLoading(false);
    }, 250);
    return () => {
      if (productSearchTimer.current) clearTimeout(productSearchTimer.current);
    };
  }, [productQuery, form.destination]);

  // Load published surveys when the user picks "survey" as the destination.
  useEffect(() => {
    if (form.destination !== "survey" || surveyOptions.length > 0) return;
    api
      .get<SurveyOption[]>("/admin/surveys?published=true&limit=100")
      .then((r) => {
        if (r.success) setSurveyOptions((r.data as SurveyOption[]) || []);
      });
  }, [form.destination, surveyOptions.length]);

  function buildPayload(f: FormState) {
    switch (f.destination) {
      case "screen":
        return { type: "screen", screen: f.screen };
      case "product":
        return { type: "product", productId: f.productId };
      case "coupon":
        return { type: "coupon", promoCode: f.promoCode };
      case "survey":
        return { type: "survey", surveyId: f.surveyId };
      case "none":
      default:
        return { type: "none" };
    }
  }

  const send = async (e: FormEvent) => {
    e.preventDefault();
    setSendError(null);

    if (form.destination === "product" && !form.productId) {
      setSendError("Selecciona un producto.");
      return;
    }
    if (form.destination === "coupon" && !form.promoCode.trim()) {
      setSendError("Introduce un código promocional.");
      return;
    }
    if (form.destination === "survey" && !form.surveyId) {
      setSendError("Selecciona una encuesta.");
      return;
    }

    setSaving(true);
    const body = {
      title: form.title,
      body: form.body,
      target: form.target,
      image_url: form.image_url || undefined,
      scheduled_at: form.scheduled_at || undefined,
      payload: buildPayload(form),
    };
    const res = await api.post("/admin/notifications/send", body);
    setSaving(false);
    if (!res.success) {
      setSendError(res.error?.message || "No se pudo enviar la notificación.");
      return;
    }
    setModal(false);
    setForm(empty);
    setProductQuery("");
    setProductHits([]);
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
        <button onClick={() => { setForm(empty); setSendError(null); setModal(true); }} className={`${btnPrimary} flex items-center gap-1`}><Plus size={16} /> Nueva campaña</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200">
        <DataTable columns={cols} data={data} loading={loading} page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Enviar notificación">
        <form onSubmit={send} className="space-y-4">
          <FormField label="Título"><input className={inputClass} required maxLength={200} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></FormField>
          <FormField label="Mensaje"><textarea className={inputClass} rows={4} required maxLength={2000} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Audiencia">
              <select className={selectClass} value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value as any })}>
                <option value="all">Todos los suscriptores</option>
                <option value="segment">Segmento</option>
              </select>
            </FormField>
            <FormField label="Al pulsar la notificación">
              <select className={selectClass} value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value as Destination })}>
                <option value="none">Solo abrir la app</option>
                <option value="screen">Abrir pantalla</option>
                <option value="product">Abrir producto</option>
                <option value="coupon">Aplicar cupón</option>
                <option value="survey">Abrir encuesta</option>
              </select>
            </FormField>
          </div>

          {form.destination === "screen" && (
            <FormField label="Pantalla">
              <select className={selectClass} value={form.screen} onChange={(e) => setForm({ ...form, screen: e.target.value as ScreenName })}>
                <option value="index">Inicio</option>
                <option value="categories">Categorías</option>
                <option value="deals">Ofertas</option>
                <option value="orders">Pedidos</option>
                <option value="profile">Perfil</option>
              </select>
            </FormField>
          )}

          {form.destination === "product" && (
            <FormField label="Producto">
              {form.productId ? (
                <div className="flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2">
                  <span className="text-sm">{form.productLabel}</span>
                  <button type="button" className="text-gray-500 hover:text-gray-800" onClick={() => setForm({ ...form, productId: "", productLabel: "" })}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    className={inputClass}
                    placeholder="Buscar producto por nombre..."
                    value={productQuery}
                    onChange={(e) => setProductQuery(e.target.value)}
                  />
                  {productLoading && <p className="text-xs text-gray-500">Buscando...</p>}
                  {!productLoading && productHits.length > 0 && (
                    <ul className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto divide-y">
                      {productHits.map((p) => (
                        <li key={p.id}>
                          <button
                            type="button"
                            className="w-full text-left px-3 py-2 hover:bg-orange-50 text-sm"
                            onClick={() => {
                              setForm({ ...form, productId: p.id, productLabel: p.name });
                              setProductHits([]);
                              setProductQuery("");
                            }}
                          >
                            {p.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </FormField>
          )}

          {form.destination === "survey" && (
            <FormField label="Encuesta">
              <select
                className={selectClass}
                value={form.surveyId}
                onChange={(e) => setForm({ ...form, surveyId: e.target.value })}
              >
                <option value="">— Selecciona una encuesta publicada —</option>
                {surveyOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
              {surveyOptions.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  No hay encuestas publicadas. Crea una en la sección Encuestas.
                </p>
              )}
            </FormField>
          )}

          {form.destination === "coupon" && (
            <FormField label="Código promocional">
              <input
                className={inputClass}
                placeholder="WELCOME10"
                maxLength={50}
                value={form.promoCode}
                onChange={(e) => setForm({ ...form, promoCode: e.target.value.toUpperCase() })}
              />
              <p className="text-xs text-gray-500 mt-1">Se aplicará automáticamente al carrito al pulsar la notificación.</p>
            </FormField>
          )}

          <FormField label="URL imagen (opcional)"><input className={inputClass} value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></FormField>
          <FormField label="Programar envío (opcional)"><input type="datetime-local" className={inputClass} value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} /></FormField>

          {sendError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{sendError}</div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModal(false)} className={btnSecondary}>Cancelar</button>
            <button type="submit" disabled={saving} className={`${btnPrimary} flex items-center gap-1`}><Send size={14} /> {saving ? "Enviando..." : "Enviar"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
