import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  LayoutDashboard, Package, Grid, ShoppingCart, Users, Tag, Image, Ticket,
  Clock, Bell, Star, FileText, LogOut, Menu, X
} from "lucide-react";
import { useState } from "react";

const NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/products", icon: Package, label: "Productos" },
  { to: "/categories", icon: Grid, label: "Categorías" },
  { to: "/orders", icon: ShoppingCart, label: "Pedidos" },
  { to: "/users", icon: Users, label: "Usuarios" },
  { to: "/promotions", icon: Tag, label: "Promociones" },
  { to: "/banners", icon: Image, label: "Artículos" },
  { to: "/promo-codes", icon: Ticket, label: "Códigos" },
  { to: "/notifications", icon: Bell, label: "Notificaciones" },
  { to: "/reviews", icon: Star, label: "Reseñas" },
  { to: "/audit-log", icon: FileText, label: "Auditoría" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

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
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? "bg-orange-600 text-white" : "text-gray-300 hover:bg-gray-800"}`
              }
            >
              <n.icon size={18} />
              {n.label}
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
    </div>
  );
}
