import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api, apiForm, BASE } from "../lib/api";
import {
  ArrowLeft,
  Send,
  Paperclip,
  FileText,
  ExternalLink,
  Loader2,
  X,
} from "lucide-react";
import { formatDateTime } from "../lib/utils";
import { btnPrimary, inputClass, selectClass } from "../components/FormField";

type Attachment = {
  id: string;
  file_url: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
};

type Message = {
  id: string;
  sender_type: "user" | "admin";
  sender_id: string;
  body: string;
  created_at: string;
  attachments: Attachment[];
};

type Ticket = {
  id: string;
  ticket_number: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  assigned_to: string | null;
  last_message_at: string;
  created_at: string;
  user_id: string;
  messages: Message[];
};

const API_HOST = BASE.replace(/\/api\/v1$/, "");

function attachmentUrl(a: Attachment) {
  if (a.file_url.startsWith("http")) return a.file_url;
  return `${API_HOST}${a.file_url}`;
}

function formatSize(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${Math.round(b / 1024)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

const STATUS_OPTIONS = [
  { value: "open", label: "Abierto" },
  { value: "in_progress", label: "En curso" },
  { value: "waiting_user", label: "Esperando usuario" },
  { value: "resolved", label: "Resuelto" },
  { value: "closed", label: "Cerrado" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Baja" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "Alta" },
  { value: "urgent", label: "Urgente" },
];

const CATEGORY_LABELS: Record<string, string> = {
  order: "Pedido",
  payment: "Pago",
  delivery: "Entrega",
  product: "Producto",
  account: "Cuenta",
  other: "Otro",
};

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!id) return;
    const r = await api.get<Ticket>(`/admin/tickets/${id}`);
    if (r.success && r.data) setTicket(r.data);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    threadRef.current?.scrollTo({
      top: threadRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [ticket?.messages?.length]);

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    const remaining = 5 - files.length;
    const accepted = picked.slice(0, remaining).filter((f) => f.size <= 8 * 1024 * 1024);
    if (accepted.length < picked.length) {
      alert("Archivos rechazados (máx 5 archivos, 8 MB cada uno)");
    }
    setFiles((prev) => [...prev, ...accepted]);
    e.target.value = "";
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const send = async () => {
    if (!id) return;
    const text = body.trim();
    if (!text && files.length === 0) return;
    setSending(true);
    const fd = new FormData();
    fd.append("body", text);
    files.forEach((f) => fd.append("files", f));
    const r = await apiForm<Ticket>(`/admin/tickets/${id}/messages`, fd);
    setSending(false);
    if (!r.success || !r.data) {
      alert(r.error?.message || "No se pudo enviar la respuesta");
      return;
    }
    setTicket(r.data);
    setBody("");
    setFiles([]);
  };

  const updateField = async (
    patch: Partial<Pick<Ticket, "status" | "priority">>,
  ) => {
    if (!id || !ticket) return;
    const key = Object.keys(patch)[0];
    setUpdating(key);
    const r = await api.patch<Ticket>(`/admin/tickets/${id}`, patch);
    setUpdating(null);
    if (r.success && r.data) setTicket({ ...ticket, ...r.data });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">Ticket no encontrado</p>
        <Link to="/tickets" className={btnPrimary}>
          Volver
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => nav("/tickets")}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-xl font-bold">{ticket.subject}</h2>
          <p className="text-xs text-gray-500 font-mono">
            {ticket.ticket_number} · Abierto {formatDateTime(ticket.created_at)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
              Detalles
            </h3>
            <dl className="text-sm space-y-2">
              <div>
                <dt className="text-gray-500">Categoría</dt>
                <dd className="font-medium">
                  {CATEGORY_LABELS[ticket.category] || ticket.category}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 mb-1">Estado</dt>
                <dd>
                  <select
                    className={selectClass}
                    value={ticket.status}
                    disabled={updating === "status"}
                    onChange={(e) => updateField({ status: e.target.value })}
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 mb-1">Prioridad</dt>
                <dd>
                  <select
                    className={selectClass}
                    value={ticket.priority}
                    disabled={updating === "priority"}
                    onChange={(e) => updateField({ priority: e.target.value })}
                  >
                    {PRIORITY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Usuario</dt>
                <dd>
                  <Link
                    to={`/users/${ticket.user_id}`}
                    className="text-orange-600 hover:underline text-sm"
                  >
                    Ver perfil →
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Última actividad</dt>
                <dd className="text-xs">
                  {formatDateTime(ticket.last_message_at)}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Conversation */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 flex flex-col h-[calc(100vh-200px)]">
          <div
            ref={threadRef}
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {ticket.messages.map((m) => {
              const mine = m.sender_type === "admin";
              return (
                <div
                  key={m.id}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl ${
                      mine
                        ? "bg-orange-600 text-white rounded-br-sm"
                        : "bg-gray-100 text-gray-900 rounded-bl-sm"
                    }`}
                  >
                    <div
                      className={`text-[10px] uppercase tracking-wide mb-1 ${
                        mine ? "text-orange-100" : "text-gray-500"
                      }`}
                    >
                      {mine ? "Soporte" : "Usuario"} ·{" "}
                      {new Date(m.created_at).toLocaleString("es-ES")}
                    </div>
                    {m.body && (
                      <p className="whitespace-pre-wrap text-sm">{m.body}</p>
                    )}
                    {m.attachments?.length > 0 && (
                      <div className="mt-2 flex flex-col gap-2">
                        {m.attachments.map((a) => {
                          const url = attachmentUrl(a);
                          if (a.mime_type.startsWith("image/")) {
                            return (
                              <a
                                key={a.id}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <img
                                  src={url}
                                  alt={a.file_name}
                                  className="max-w-xs rounded-lg"
                                />
                              </a>
                            );
                          }
                          return (
                            <a
                              key={a.id}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                                mine
                                  ? "bg-white/10 hover:bg-white/20"
                                  : "bg-white border border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              <FileText size={16} />
                              <span className="flex-1 truncate">
                                {a.file_name}
                              </span>
                              <span className="text-[11px] opacity-70">
                                {formatSize(a.size_bytes)}
                              </span>
                              <ExternalLink size={12} />
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Composer */}
          <div className="border-t border-gray-200 p-3">
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {files.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1 text-xs"
                  >
                    <FileText size={12} />
                    <span className="max-w-[140px] truncate">{f.name}</span>
                    <button
                      onClick={() => removeFile(i)}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-end gap-2">
              <label className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                <Paperclip size={18} className="text-gray-600" />
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={onPickFiles}
                />
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Escribe tu respuesta…"
                className={`${inputClass} flex-1 resize-none`}
                rows={2}
                maxLength={5000}
              />
              <button
                onClick={send}
                disabled={
                  sending || (body.trim().length === 0 && files.length === 0)
                }
                className={`${btnPrimary} flex items-center gap-1`}
              >
                {sending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}{" "}
                Enviar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
