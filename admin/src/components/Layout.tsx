import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  LayoutDashboard, Package, Grid, ShoppingCart, Users, Tag, Image, Ticket,
  Bell, Star, FileText, LogOut, Menu, X, ShoppingBag, LifeBuoy, Radio,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useSse, useSseEvent } from "../contexts/SseContext";

const NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/orders/live", icon: Radio, label: "En vivo" },
  { to: "/products", icon: Package, label: "Productos" },
  { to: "/categories", icon: Grid, label: "Categorías" },
  { to: "/orders", icon: ShoppingCart, label: "Pedidos" },
  { to: "/users", icon: Users, label: "Usuarios" },
  { to: "/tickets", icon: LifeBuoy, label: "Soporte", badge: "tickets" as const },
  { to: "/promotions", icon: Tag, label: "Promociones" },
  { to: "/banners", icon: Image, label: "Artículos" },
  { to: "/promo-codes", icon: Ticket, label: "Códigos" },
  { to: "/notifications", icon: Bell, label: "Notificaciones" },
  { to: "/reviews", icon: Star, label: "Reseñas" },
  { to: "/audit-log", icon: FileText, label: "Auditoría" },
];

type Toast =
  | { id: number; kind: "order"; total: string; payment: string }
  | { id: number; kind: "ticket"; subject: string; ticket_number: string };

let toastSeq = 0;

const STATUS_LABEL: Record<string, string> = {
  connecting: "Conectando…",
  live: "En vivo",
  reconnecting: "Reconectando…",
};

export default function Layout() {
  const { user, logout } = useAuth();
  const { status } = useSse();
  const [open, setOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [unreadTickets, setUnreadTickets] = useState(0);

  const addOrderToast = (total: string, payment: string) => {
    const id = ++toastSeq;
    setToasts((prev) => [...prev, { id, kind: "order", total, payment }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 6000);
  };

  const addTicketToast = (subject: string, ticket_number: string) => {
    const id = ++toastSeq;
    setToasts((prev) => [...prev, { id, kind: "ticket", subject, ticket_number }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 6000);
  };

  useEffect(() => {
    let cancelled = false;
    const loadStats = () => {
      api.get("/admin/dashboard").then((r) => {
        if (!cancelled && r.success) {
          setUnreadTickets(r.data?.unread_tickets || 0);
        }
      });
    };
    loadStats();
    const iv = setInterval(loadStats, 60_000);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, []);

  useSseEvent("new_order", (data) => {
    addOrderToast(data.total, data.payment_method ?? "");
  });

  useSseEvent("new_ticket", (data) => {
    addTicketToast(data.subject || "Nuevo ticket", data.ticket_number || "");
    setUnreadTickets((n) => n + 1);
  });

  useSseEvent("new_ticket_message", (data) => {
    addTicketToast(
      data.subject || "Mensaje de soporte",
      data.ticket_number || "",
    );
    setUnreadTickets((n) => n + 1);
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-56 bg-gray-900 text-white transform transition-transform lg:relative lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold text-orange-500">Azafaran Admin</h1>
        </div>
        <nav className="p-2 space-y-0.5 overflow-y-auto h-[calc(100vh-8rem)]">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              onClick={() => {
                setOpen(false);
                if (n.badge === "tickets") setUnreadTickets(0);
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? "bg-orange-600 text-white" : "text-gray-300 hover:bg-gray-800"}`
              }
            >
              <n.icon size={18} />
              <span className="flex-1">{n.label}</span>
              {n.badge === "tickets" && unreadTickets > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 min-w-[18px] text-center">
                  {unreadTickets > 99 ? "99+" : unreadTickets}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-800">
          <button onClick={logout} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm w-full px-3 py-2 rounded-lg hover:bg-gray-800">
            <LogOut size={18} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {open && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button className="lg:hidden p-1" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <span
              className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${
                status === "live"
                  ? "bg-green-50 text-green-700"
                  : status === "connecting"
                  ? "bg-yellow-50 text-yellow-700"
                  : "bg-red-50 text-red-700"
              }`}
              title="Estado de conexión en tiempo real"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  status === "live"
                    ? "bg-green-500 animate-pulse"
                    : status === "connecting"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              />
              {STATUS_LABEL[status]}
            </span>
            <span className="text-sm text-gray-500">{user?.first_name} {user?.last_name}</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* Alert toasts */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg pointer-events-auto animate-in slide-in-from-right-4 duration-300"
          >
            <div className="flex-shrink-0 bg-orange-500 rounded-full p-1.5">
              {t.kind === "order" ? (
                <ShoppingBag size={16} />
              ) : (
                <LifeBuoy size={16} />
              )}
            </div>
            <div>
              {t.kind === "order" ? (
                <>
                  <p className="text-sm font-semibold">Nuevo pedido</p>
                  <p className="text-xs text-gray-400">
                    €{t.total}
                    {t.payment ? ` · ${t.payment}` : ""}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold">Soporte</p>
                  <p className="text-xs text-gray-400">
                    {t.ticket_number ? `${t.ticket_number} · ` : ""}
                    {t.subject}
                  </p>
                </>
              )}
            </div>
            <button
              onClick={() =>
                setToasts((prev) => prev.filter((x) => x.id !== t.id))
              }
              className="ml-2 text-gray-400 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
