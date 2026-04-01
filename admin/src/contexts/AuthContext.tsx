import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { api, setTokens, clearTokens } from "../lib/api";

type User = { id: string; email: string; first_name: string; last_name: string; role: string };
type AuthCtx = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("admin_tokens");
    if (!raw) { setLoading(false); return; }
    api.get<User>("/users/").then((r) => {
      if (r.success && r.data?.role === "admin") setUser(r.data);
      else clearTokens();
      setLoading(false);
    });
  }, []);

  const login = async (email: string, password: string) => {
    const r = await api("/auth/login", { method: "POST", body: { email, password }, auth: false });
    if (!r.success) return r.error?.message || "Error";
    if (r.data.user.role !== "admin") { return "No tienes permisos de administrador"; }
    setTokens({ accessToken: r.data.accessToken, refreshToken: r.data.refreshToken });
    setUser(r.data.user);
    return null;
  };

  const logout = () => { clearTokens(); setUser(null); };

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
