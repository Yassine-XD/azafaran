import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  LayoutDashboard, Package, Grid, ShoppingCart, Users, Tag, Image, Ticket,
  Clock, Bell, Star, FileText, LogOut, Menu, X, ShoppingBag, LifeBuoy,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { api, BASE, getTokens } from "../lib/api";

const NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
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

export default function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [unreadTickets, setUnreadTickets] = useState(0);
  const activeRef = useRef(true);

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

  useEffect(() => {
    activeRef.current = true;

    const connect = async () => {
      const tokens = getTokens();
      if (!tokens?.accessToken) return;

      let controller = new AbortController();

      const run = async () => {
        try {
          const res = await fetch(`${BASE}/admin/events`, {
            headers: { Authorization: `Bearer ${tokens.accessToken}` },
            signal: controller.signal,
          });

          if (!res.ok || !res.body) return;

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (activeRef.current) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const chunks = buffer.split("\n\n");
            buffer = chunks.pop() ?? "";

            for (const chunk of chunks) {
              const lines = chunk.split("\n");
              const eventLine = lines.find((l) => l.startsWith("event:"));
              const dataLine = lines.find((l) => l.startsWith("data:"));
              if (eventLine?.includes("new_order") && dataLine) {
                try {
                  const data = JSON.parse(dataLine.slice(5).trim());
                  addOrderToast(data.total, data.payment_method ?? "");
                } catch {
                  // malformed data — ignore
                }
              } else if (
                eventLine &&
                (eventLine.includes("new_ticket_message") ||
                  eventLine.includes("new_ticket")) &&
                dataLine
              ) {
                try {
                  const data = JSON.parse(dataLine.slice(5).trim());
                  addTicketToast(
                    data.subject || "Mensaje de soporte",
                    data.ticket_number || "",
                  );
                  setUnreadTickets((n) => n + 1);
                } catch {
                  // ignore
                }
              }
            }
          }
        } catch {
          // aborted or network error
        }

        // Reconnect after 5 s if still active
        if (activeRef.current) {
          setTimeout(() => {
            controller = new AbortController();
            run();
          }, 5000);
        }
      };

      run();

      return () => {
        activeRef.current = false;
        controller.abort();
      };
    };

    let cleanup: (() => void) | undefined;
    connect().then((fn) => { cleanup = fn; });

    return () => {
      activeRef.current = false;
      cleanup?.();
    };
  }, []);

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
          <span className="text-sm text-gray-500">{user?.first_name} {user?.last_name}</span>
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
