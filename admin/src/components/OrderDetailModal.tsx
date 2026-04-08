import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { formatCurrency, formatDate, formatDateTime } from "../lib/utils";
import StatusBadge from "./StatusBadge";
import { X, Loader2, User, MapPin, CreditCard, Package, Calendar, FileText } from "lucide-react";

const STATUSES = ["pending", "confirmed", "preparing", "shipped", "delivered", "cancelled"];

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  preparing: "Preparando",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  card: "Tarjeta",
  cash: "Efectivo",
  bizum: "Bizum",
};

type OrderDetail = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  payment_ref: string | null;
  subtotal: number;
  delivery_fee: number;
  discount_amount: number;
  total: number;
  delivery_notes: string | null;
  promo_code_id: string | null;
  address_snapshot: any;
  created_at: string;
  updated_at: string;
  // User fields
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  // Delivery slot fields
  slot_date: string | null;
  slot_start: string | null;
  slot_end: string | null;
  // Items
  items: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    line_total: number;
    product_snapshot: any;
  }>;
};

type Props = {
  orderId: string | null;
  onClose: () => void;
  onStatusChange?: () => void;
};

export default function OrderDetailModal({ orderId, onClose, onStatusChange }: Props) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    setOrder(null);
    setError("");
    api.get<OrderDetail>(`/admin/orders/${orderId}`).then((r) => {
      if (r.success && r.data) {
        setOrder(r.data);
        setSelectedStatus(r.data.status);
      } else {
        setError("No se pudo cargar el pedido.");
      }
      setLoading(false);
    });
  }, [orderId]);

  const handleStatusUpdate = async () => {
    if (!order || selectedStatus === order.status) return;
    setUpdatingStatus(true);
    const r = await api.patch(`/admin/orders/${order.id}/status`, { status: selectedStatus });
    if (r.success) {
      setOrder((prev) => prev ? { ...prev, status: selectedStatus } : prev);
      onStatusChange?.();
    }
    setUpdatingStatus(false);
  };

  if (!orderId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Detalle del pedido</h2>
            {order && (
              <p className="text-sm text-gray-500 mt-0.5">#{order.order_number || order.id.slice(0, 8).toUpperCase()}</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
          )}

          {error && (
            <div className="text-center text-red-500 py-10">{error}</div>
          )}

          {order && !loading && (
            <>
              {/* Status row */}
              <div className="flex items-center gap-3">
                <StatusBadge status={order.status} />
                <StatusBadge status={order.payment_status} />
                <span className="text-xs text-gray-400 ml-auto">{formatDateTime(order.created_at)}</span>
              </div>

              {/* Client info */}
              <section>
                <div className="flex items-center gap-2 mb-2">
                  <User size={15} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente</span>
                </div>
                <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm space-y-1">
                  <p className="font-medium text-gray-900">{order.first_name} {order.last_name}</p>
                  <p className="text-gray-600">{order.email}</p>
                  {order.phone && <p className="text-gray-600">{order.phone}</p>}
                </div>
              </section>

              {/* Delivery address */}
              {order.address_snapshot && (
                <section>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={15} className="text-gray-400" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Dirección de entrega</span>
                  </div>
                  <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm space-y-0.5">
                    {order.address_snapshot.line1 && <p className="text-gray-900">{order.address_snapshot.line1}</p>}
                    {order.address_snapshot.line2 && <p className="text-gray-600">{order.address_snapshot.line2}</p>}
                    <p className="text-gray-600">
                      {[order.address_snapshot.city, order.address_snapshot.postal_code, order.address_snapshot.country].filter(Boolean).join(", ")}
                    </p>
                  </div>
                </section>
              )}

              {/* Delivery slot */}
              {order.slot_date && (
                <section>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={15} className="text-gray-400" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Franja de entrega</span>
                  </div>
                  <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-900">
                    {formatDate(order.slot_date)}{order.slot_start && order.slot_end ? ` · ${order.slot_start.slice(0, 5)} – ${order.slot_end.slice(0, 5)}` : ""}
                  </div>
                </section>
              )}

              {/* Notes */}
              {order.delivery_notes && (
                <section>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={15} className="text-gray-400" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notas de entrega</span>
                  </div>
                  <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 italic">
                    {order.delivery_notes}
                  </div>
                </section>
              )}

              {/* Payment */}
              <section>
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard size={15} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pago</span>
                </div>
                <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Método</span>
                    <span className="font-medium">{PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method}</span>
                  </div>
                  {order.payment_ref && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Referencia</span>
                      <span className="font-mono text-xs text-gray-700 truncate max-w-[180px]">{order.payment_ref}</span>
                    </div>
                  )}
                </div>
              </section>

              {/* Items */}
              <section>
                <div className="flex items-center gap-2 mb-2">
                  <Package size={15} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Artículos ({order.items.length})</span>
                </div>
                <div className="bg-gray-50 rounded-xl divide-y divide-gray-100">
                  {order.items.map((item) => {
                    const snap = item.product_snapshot || {};
                    const name = snap.name || "Producto";
                    const variant = snap.variant_label || snap.weight_label || "";
                    const image = snap.images?.[0]?.url || snap.image_url || null;
                    return (
                      <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                        {image ? (
                          <img src={image} alt={name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                          {variant && <p className="text-xs text-gray-500">{variant}</p>}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-medium">{formatCurrency(item.line_total)}</p>
                          <p className="text-xs text-gray-400">{item.quantity} × {formatCurrency(item.unit_price)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Totals */}
              <section className="bg-gray-50 rounded-xl px-4 py-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span>{order.delivery_fee === 0 ? "Gratis" : formatCurrency(order.delivery_fee)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento</span>
                    <span>-{formatCurrency(order.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </section>

              {/* Change status */}
              <section>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Cambiar estado</p>
                <div className="flex gap-2">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleStatusUpdate}
                    disabled={updatingStatus || selectedStatus === order.status}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {updatingStatus ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
