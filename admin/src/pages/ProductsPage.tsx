import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import { formatCurrency, slugify } from "../lib/utils";
import DataTable, { type Column } from "../components/DataTable";
import Modal from "../components/Modal";
import FormField, { inputClass, selectClass, btnPrimary, btnSecondary } from "../components/FormField";
import StatusBadge from "../components/StatusBadge";
import { Plus, Pencil, Trash2, X, Package } from "lucide-react";

type LangCode = "es" | "ca" | "en";
const LANGS: LangCode[] = ["es", "ca", "en"];
const LANG_LABELS: Record<LangCode, string> = { es: "ES", ca: "CA", en: "EN" };

type I18nMap = { es: string; ca: string; en: string };
const emptyI18n = (): I18nMap => ({ es: "", ca: "", en: "" });

type Product = {
  id: string; name: string; slug: string; description: string; short_desc: string;
  category_id: string; category_name: string; price_per_kg: string; unit_type: string;
  unit_label_override: string | null;
  images: string[]; tags: string[]; halal_cert_id: string; is_featured: boolean; is_active: boolean;
  name_i18n?: I18nMap; description_i18n?: I18nMap; short_desc_i18n?: I18nMap;
};

type Variant = {
  id: string; product_id: string; label: string; weight_grams: number;
  price: string; stock_qty: number; sku: string; is_active: boolean;
  label_i18n?: I18nMap;
  compare_at_price: string | null;
  low_stock_threshold: number | null;
  badge_label: string | null;
};

type PackItem = {
  id: string; pack_id: string; product_id: string; quantity: number;
  custom_label: string | null; sort_order: number;
  product_name: string; product_images: any[]; product_price_per_kg: string; product_category_name: string;
};

type Category = { id: string; name: string };

const emptyForm = () => ({
  name: "", slug: "", category_id: "",
  price_per_kg: "", unit_type: "kg", unit_label_override: "",
  halal_cert_id: "", is_featured: false, is_active: true,
  images: [""], tags: "",
  name_i18n: emptyI18n(),
  description_i18n: emptyI18n(),
  short_desc_i18n: emptyI18n(),
});

const emptyVarForm = () => ({
  label_i18n: emptyI18n(),
  weight_grams: "",
  price: "",
  compare_at_price: "",
  stock_qty: "",
  low_stock_threshold: "",
  badge_label: "",
  sku: "",
});

function LangTabs({ active, onChange }: { active: LangCode; onChange: (l: LangCode) => void }) {
  return (
    <div className="flex gap-1 mb-3">
      {LANGS.map((l) => (
        <button key={l} type="button" onClick={() => onChange(l)}
          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${active === l ? "bg-orange-500 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-600"}`}>
          {LANG_LABELS[l]}
        </button>
      ))}
    </div>
  );
}

export default function ProductsPage() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [catFilter, setCatFilter] = useState("");

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [langTab, setLangTab] = useState<LangCode>("es");
  const [saving, setSaving] = useState(false);

  // Variants
  const [varModal, setVarModal] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [varProduct, setVarProduct] = useState<Product | null>(null);
  const [varForm, setVarForm] = useState(emptyVarForm());
  const [varLangTab, setVarLangTab] = useState<LangCode>("es");
  const [editingVar, setEditingVar] = useState<Variant | null>(null);

  // Pack Items
  const [packModal, setPackModal] = useState(false);
  const [packItems, setPackItems] = useState<PackItem[]>([]);
  const [packProduct, setPackProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [packForm, setPackForm] = useState({ product_id: "", quantity: "1", custom_label: "", sort_order: "0" });
  const [editingPackItem, setEditingPackItem] = useState<PackItem | null>(null);

  const fetchData = () => {
    setLoading(true);
    let q = `/admin/products?page=${page}&limit=20`;
    if (search) q += `&search=${encodeURIComponent(search)}`;
    if (catFilter) q += `&category=${catFilter}`;
    api.get(q).then((r) => {
      if (r.success) { setData(r.data as any || []); setTotalPages(r.meta?.total_pages || 1); }
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, [page, search, catFilter]);
  useEffect(() => {
    api.get("/admin/categories?limit=100").then((r) => {
      if (r.success) setCategories(r.data as any || []);
    });
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setLangTab("es");
    setModal(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      slug: p.slug,
      category_id: p.category_id,
      price_per_kg: p.price_per_kg,
      unit_type: p.unit_type || "kg",
      unit_label_override: p.unit_label_override || "",
      halal_cert_id: p.halal_cert_id || "",
      is_featured: p.is_featured,
      is_active: p.is_active,
      images: p.images?.length ? p.images : [""],
      tags: (p.tags || []).join(", "),
      name_i18n: p.name_i18n || { es: p.name || "", ca: "", en: "" },
      description_i18n: p.description_i18n || { es: p.description || "", ca: "", en: "" },
      short_desc_i18n: p.short_desc_i18n || { es: p.short_desc || "", ca: "", en: "" },
    });
    setLangTab("es");
    setModal(true);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      name: form.name_i18n.es || form.name,
      slug: form.slug,
      category_id: form.category_id,
      price_per_kg: Number(form.price_per_kg),
      unit_type: form.unit_type,
      unit_label_override: form.unit_label_override.trim() || null,
      halal_cert_id: form.halal_cert_id,
      is_featured: form.is_featured,
      is_active: form.is_active,
      images: form.images.filter((u) => u.trim()),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      name_i18n: form.name_i18n,
      description_i18n: form.description_i18n,
      short_desc_i18n: form.short_desc_i18n,
    };
    const res = editing
      ? await api.put(`/admin/products/${editing.id}`, body)
      : await api.post("/admin/products", body);
    setSaving(false);
    if (res.success) { setModal(false); fetchData(); }
  };

  const del = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    await api.del(`/admin/products/${id}`);
    fetchData();
  };

  // Variants
  const openVariants = (p: Product) => {
    setVarProduct(p);
    setVarModal(true);
    setEditingVar(null);
    setVarForm(emptyVarForm());
    setVarLangTab("es");
    api.get(`/admin/products/${p.id}`).then((r: any) => {
      if (r.success && r.data?.variants) setVariants(r.data.variants);
      else setVariants([]);
    });
  };

  const saveVar = async (e: FormEvent) => {
    e.preventDefault();
    if (!varProduct) return;
    const body = {
      label: varForm.label_i18n.es,
      label_i18n: varForm.label_i18n,
      weight_grams: Number(varForm.weight_grams),
      price: Number(varForm.price),
      stock_qty: Number(varForm.stock_qty),
      sku: varForm.sku,
      compare_at_price: varForm.compare_at_price ? Number(varForm.compare_at_price) : null,
      low_stock_threshold: varForm.low_stock_threshold !== "" ? Number(varForm.low_stock_threshold) : null,
      badge_label: varForm.badge_label.trim() || null,
    };
    if (editingVar) {
      await api.put(`/admin/products/${varProduct.id}/variants/${editingVar.id}`, body);
    } else {
      await api.post(`/admin/products/${varProduct.id}/variants`, body);
    }
    setEditingVar(null);
    setVarForm(emptyVarForm());
    const r: any = await api.get(`/admin/products/${varProduct.id}`);
    if (r.success && r.data?.variants) setVariants(r.data.variants);
  };

  // Pack Items
  const openPackItems = async (p: Product) => {
    setPackProduct(p);
    setPackModal(true);
    setEditingPackItem(null);
    setPackForm({ product_id: "", quantity: "1", custom_label: "", sort_order: "0" });
    const r: any = await api.get(`/admin/products/${p.id}/pack-items`);
    if (r.success) setPackItems(r.data || []);
    else setPackItems([]);
    const pr: any = await api.get("/admin/products?page=1&limit=200");
    if (pr.success) {
      setAllProducts((pr.data || []).filter((prod: Product) => prod.id !== p.id && prod.unit_type !== "pack"));
    }
  };

  const savePackItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!packProduct) return;
    const body = {
      product_id: packForm.product_id,
      quantity: Number(packForm.quantity),
      custom_label: packForm.custom_label || null,
      sort_order: Number(packForm.sort_order),
    };
    if (editingPackItem) {
      await api.put(`/admin/products/${packProduct.id}/pack-items/${editingPackItem.id}`, body);
    } else {
      await api.post(`/admin/products/${packProduct.id}/pack-items`, body);
    }
    setEditingPackItem(null);
    setPackForm({ product_id: "", quantity: "1", custom_label: "", sort_order: "0" });
    const r: any = await api.get(`/admin/products/${packProduct.id}/pack-items`);
    if (r.success) setPackItems(r.data || []);
  };

  const deletePackItem = async (itemId: string) => {
    if (!packProduct || !confirm("¿Eliminar este producto del pack?")) return;
    await api.del(`/admin/products/${packProduct.id}/pack-items/${itemId}`);
    const r: any = await api.get(`/admin/products/${packProduct.id}/pack-items`);
    if (r.success) setPackItems(r.data || []);
    else setPackItems([]);
  };

  const cols: Column<Product>[] = [
    { key: "name", header: "Nombre" },
    { key: "category_name", header: "Categoría" },
    { key: "price_per_kg", header: "Precio/kg", render: (r) => formatCurrency(Number(r.price_per_kg)) },
    { key: "is_featured", header: "Destacado", render: (r) => r.is_featured ? "Sí" : "No" },
    { key: "is_active", header: "Estado", render: (r) => (
      <button
        onClick={async (e) => {
          e.stopPropagation();
          await api.put(`/admin/products/${r.id}`, { is_active: !r.is_active });
          fetchData();
        }}
        className={`px-2 py-0.5 rounded text-xs font-medium ${
          r.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {r.is_active ? "Activo" : "Inactivo"}
      </button>
    ) },
    {
      key: "actions", header: "Acciones", render: (r) => (
        <div className="flex gap-1">
          {r.unit_type === "pack" && (
            <button onClick={(e) => { e.stopPropagation(); openPackItems(r); }} className="p-1.5 hover:bg-gray-100 rounded text-orange-600 text-xs border border-orange-200 flex items-center gap-1">
              <Package size={13} /> Contenido
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); openVariants(r); }} className="p-1.5 hover:bg-gray-100 rounded text-blue-600 text-xs border border-blue-200">Variantes</button>
          <button onClick={(e) => { e.stopPropagation(); openEdit(r); }} className="p-1.5 hover:bg-gray-100 rounded text-gray-600"><Pencil size={15} /></button>
          <button onClick={(e) => { e.stopPropagation(); del(r.id); }} className="p-1.5 hover:bg-gray-100 rounded text-red-600"><Trash2 size={15} /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Productos</h2>
        <button onClick={openCreate} className={`${btnPrimary} flex items-center gap-1`}><Plus size={16} /> Añadir</button>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          type="text" placeholder="Buscar..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className={`${inputClass} max-w-xs`}
        />
        <select value={catFilter} onChange={(e) => { setCatFilter(e.target.value); setPage(1); }} className={`${selectClass} max-w-xs`}>
          <option value="">Todas las categorías</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <DataTable columns={cols} data={data} loading={loading} page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Create/Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Editar producto" : "Nuevo producto"} wide>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Slug">
              <input className={inputClass} required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </FormField>
            <FormField label="Categoría">
              <select className={selectClass} required value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                <option value="">Seleccionar</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Precio/kg">
              <input type="number" step="0.01" className={inputClass} required value={form.price_per_kg} onChange={(e) => setForm({ ...form, price_per_kg: e.target.value })} />
            </FormField>
            <FormField label="Tipo unidad">
              <select className={selectClass} value={form.unit_type} onChange={(e) => setForm({ ...form, unit_type: e.target.value })}>
                <option value="kg">kg</option>
                <option value="unit">Unidad</option>
                <option value="pack">Pack</option>
              </select>
            </FormField>
          </div>
          <FormField label="Cert. Halal">
            <input className={inputClass} value={form.halal_cert_id} onChange={(e) => setForm({ ...form, halal_cert_id: e.target.value })} />
          </FormField>
          <FormField label='Etiqueta pack (opcional, ej: "Pack familiar", "Bandeja 4 filetes")'>
            <input
              className={inputClass}
              maxLength={60}
              value={form.unit_label_override}
              onChange={(e) => setForm({ ...form, unit_label_override: e.target.value })}
            />
          </FormField>

          {/* i18n section */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <p className="text-sm font-semibold text-gray-700 mb-3">Traducciones</p>
            <LangTabs active={langTab} onChange={setLangTab} />
            <div className="space-y-3">
              <FormField label={`Nombre (${LANG_LABELS[langTab]})`}>
                <input
                  className={inputClass}
                  required={langTab === "es"}
                  value={form.name_i18n[langTab]}
                  onChange={(e) => {
                    const updated = { ...form.name_i18n, [langTab]: e.target.value };
                    setForm({ ...form, name_i18n: updated, ...(langTab === "es" ? { name: e.target.value, slug: slugify(e.target.value) } : {}) });
                  }}
                />
              </FormField>
              <FormField label={`Descripción (${LANG_LABELS[langTab]})`}>
                <textarea
                  className={inputClass} rows={3}
                  value={form.description_i18n[langTab]}
                  onChange={(e) => setForm({ ...form, description_i18n: { ...form.description_i18n, [langTab]: e.target.value } })}
                />
              </FormField>
              <FormField label={`Descripción corta (${LANG_LABELS[langTab]})`}>
                <input
                  className={inputClass}
                  value={form.short_desc_i18n[langTab]}
                  onChange={(e) => setForm({ ...form, short_desc_i18n: { ...form.short_desc_i18n, [langTab]: e.target.value } })}
                />
              </FormField>
            </div>
          </div>

          <FormField label="Tags (separados por coma)">
            <input className={inputClass} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="halal, premium, oferta" />
          </FormField>
          <FormField label="Imágenes (URLs)">
            {form.images.map((url, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input className={inputClass} value={url} placeholder="https://..." onChange={(e) => {
                  const imgs = [...form.images]; imgs[i] = e.target.value; setForm({ ...form, images: imgs });
                }} />
                {form.images.length > 1 && (
                  <button type="button" onClick={() => { const imgs = form.images.filter((_, j) => j !== i); setForm({ ...form, images: imgs }); }} className="p-2 text-red-500">
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setForm({ ...form, images: [...form.images, ""] })} className="text-sm text-orange-600 hover:underline">+ Añadir imagen</button>
          </FormField>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
              Producto destacado
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              Activo
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModal(false)} className={btnSecondary}>Cancelar</button>
            <button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Guardando..." : "Guardar"}</button>
          </div>
        </form>
      </Modal>

      {/* Variants Modal */}
      <Modal open={varModal} onClose={() => setVarModal(false)} title={`Variantes — ${varProduct?.name || ""}`} wide>
        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left px-3 py-2">Etiqueta (ES)</th>
              <th className="text-left px-3 py-2">Peso (g)</th>
              <th className="text-left px-3 py-2">Precio</th>
              <th className="text-left px-3 py-2">Stock</th>
              <th className="text-left px-3 py-2">SKU</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v) => (
              <tr key={v.id} className="border-b">
                <td className="px-3 py-2">{v.label_i18n?.es || v.label}</td>
                <td className="px-3 py-2">{v.weight_grams}</td>
                <td className="px-3 py-2">{formatCurrency(Number(v.price))}</td>
                <td className="px-3 py-2">{v.stock_qty}</td>
                <td className="px-3 py-2">{v.sku}</td>
                <td className="px-3 py-2 flex gap-2">
                  <button onClick={() => {
                    setEditingVar(v);
                    setVarForm({
                      label_i18n: v.label_i18n || { es: v.label, ca: "", en: "" },
                      weight_grams: String(v.weight_grams),
                      price: v.price,
                      compare_at_price: v.compare_at_price != null ? String(v.compare_at_price) : "",
                      stock_qty: String(v.stock_qty),
                      low_stock_threshold: v.low_stock_threshold != null ? String(v.low_stock_threshold) : "",
                      badge_label: v.badge_label || "",
                      sku: v.sku || "",
                    });
                    setVarLangTab("es");
                  }} className="text-blue-600 text-xs hover:underline">Editar</button>
                  <button onClick={async () => {
                    if (!confirm("¿Eliminar esta variante?")) return;
                    await api.del(`/admin/products/${varProduct!.id}/variants/${v.id}`);
                    const r: any = await api.get(`/admin/products/${varProduct!.id}`);
                    if (r.success && r.data?.variants) setVariants(r.data.variants);
                    else setVariants([]);
                  }} className="text-red-600 text-xs hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <form onSubmit={saveVar} className="border-t pt-4">
          <p className="font-medium text-sm mb-3">{editingVar ? "Editar variante" : "Nueva variante"}</p>
          <div className="border rounded-lg p-3 bg-gray-50 mb-3">
            <LangTabs active={varLangTab} onChange={setVarLangTab} />
            <FormField label={`Etiqueta (${LANG_LABELS[varLangTab]})`}>
              <input
                className={inputClass}
                required={varLangTab === "es"}
                placeholder={`Etiqueta en ${LANG_LABELS[varLangTab]}`}
                value={varForm.label_i18n[varLangTab]}
                onChange={(e) => setVarForm({ ...varForm, label_i18n: { ...varForm.label_i18n, [varLangTab]: e.target.value } })}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <input type="number" className={inputClass} placeholder="Peso (g)" required value={varForm.weight_grams} onChange={(e) => setVarForm({ ...varForm, weight_grams: e.target.value })} />
            <input type="number" step="0.01" className={inputClass} placeholder="Precio" required value={varForm.price} onChange={(e) => setVarForm({ ...varForm, price: e.target.value })} />
            <input type="number" className={inputClass} placeholder="Stock" required value={varForm.stock_qty} onChange={(e) => setVarForm({ ...varForm, stock_qty: e.target.value })} />
            <input className={inputClass} placeholder="SKU" value={varForm.sku} onChange={(e) => setVarForm({ ...varForm, sku: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <input
              type="number"
              step="0.01"
              className={inputClass}
              placeholder="Precio antes (anchor, opcional)"
              value={varForm.compare_at_price}
              onChange={(e) => setVarForm({ ...varForm, compare_at_price: e.target.value })}
            />
            <input
              type="number"
              min="0"
              className={inputClass}
              placeholder="Umbral stock bajo (opcional)"
              value={varForm.low_stock_threshold}
              onChange={(e) => setVarForm({ ...varForm, low_stock_threshold: e.target.value })}
            />
            <input
              className={inputClass}
              placeholder='Etiqueta promo (ej: "Oferta", "Nuevo")'
              maxLength={40}
              value={varForm.badge_label}
              onChange={(e) => setVarForm({ ...varForm, badge_label: e.target.value })}
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button type="submit" className={btnPrimary}>{editingVar ? "Actualizar" : "Añadir"}</button>
            {editingVar && <button type="button" onClick={() => { setEditingVar(null); setVarForm(emptyVarForm()); }} className={btnSecondary}>Cancelar</button>}
          </div>
        </form>
      </Modal>

      {/* Pack Items Modal */}
      <Modal open={packModal} onClose={() => setPackModal(false)} title={`Contenido del pack — ${packProduct?.name || ""}`} wide>
        {packItems.length === 0 ? (
          <p className="text-gray-500 text-sm mb-4">Este pack no tiene productos aún. Añade productos abajo.</p>
        ) : (
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-3 py-2">Producto</th>
                <th className="text-left px-3 py-2">Categoría</th>
                <th className="text-left px-3 py-2">Cantidad</th>
                <th className="text-left px-3 py-2">Etiqueta personalizada</th>
                <th className="text-left px-3 py-2">Orden</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {packItems.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="px-3 py-2 font-medium">{item.product_name}</td>
                  <td className="px-3 py-2 text-gray-500">{item.product_category_name}</td>
                  <td className="px-3 py-2">{item.quantity}</td>
                  <td className="px-3 py-2 text-gray-500">{item.custom_label || "—"}</td>
                  <td className="px-3 py-2">{item.sort_order}</td>
                  <td className="px-3 py-2 flex gap-2">
                    <button onClick={() => {
                      setEditingPackItem(item);
                      setPackForm({
                        product_id: item.product_id,
                        quantity: String(item.quantity),
                        custom_label: item.custom_label || "",
                        sort_order: String(item.sort_order),
                      });
                    }} className="text-blue-600 text-xs hover:underline">Editar</button>
                    <button onClick={() => deletePackItem(item.id)} className="text-red-600 text-xs hover:underline">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <form onSubmit={savePackItem} className="border-t pt-4">
          <p className="font-medium text-sm mb-3">{editingPackItem ? "Editar producto del pack" : "Añadir producto al pack"}</p>
          <div className="grid grid-cols-4 gap-2">
            <select
              className={selectClass}
              required
              value={packForm.product_id}
              onChange={(e) => setPackForm({ ...packForm, product_id: e.target.value })}
              disabled={!!editingPackItem}
            >
              <option value="">Seleccionar producto</option>
              {allProducts.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.category_name})</option>
              ))}
            </select>
            <input type="number" min="1" className={inputClass} placeholder="Cantidad" required value={packForm.quantity} onChange={(e) => setPackForm({ ...packForm, quantity: e.target.value })} />
            <input className={inputClass} placeholder="Etiqueta personalizada" value={packForm.custom_label} onChange={(e) => setPackForm({ ...packForm, custom_label: e.target.value })} />
            <input type="number" className={inputClass} placeholder="Orden" value={packForm.sort_order} onChange={(e) => setPackForm({ ...packForm, sort_order: e.target.value })} />
          </div>
          <div className="flex gap-2 mt-3">
            <button type="submit" className={btnPrimary}>{editingPackItem ? "Actualizar" : "Añadir"}</button>
            {editingPackItem && (
              <button type="button" onClick={() => {
                setEditingPackItem(null);
                setPackForm({ product_id: "", quantity: "1", custom_label: "", sort_order: "0" });
              }} className={btnSecondary}>Cancelar</button>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
}
