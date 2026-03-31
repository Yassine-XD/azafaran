import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, tokenStorage } from "@/lib/api";
import type { User } from "@/lib/types";

type AuthState = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

type AuthContextType = AuthState & {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { first_name: string; last_name: string; email: string; password: string; phone: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Check for existing session on mount
  useEffect(() => {
    (async () => {
      const tokens = await tokenStorage.getTokens();
      if (tokens?.accessToken) {
        const res = await api.get<User>("/users/");
        if (res.success && res.data) {
          setState({ user: res.data, isLoading: false, isAuthenticated: true });
          return;
        }
      }
      setState((s) => ({ ...s, isLoading: false }));
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password }, false);
    if (!res.success) {
      return { success: false, error: res.error?.message || "Error al iniciar sesión" };
    }
    await tokenStorage.setTokens({
      accessToken: res.data.accessToken,
      refreshToken: res.data.refreshToken,
    });
    setState({ user: res.data.user, isLoading: false, isAuthenticated: true });
    return { success: true };
  }, []);

  const register = useCallback(async (data: { first_name: string; last_name: string; email: string; password: string; phone: string }) => {
    const res = await api.post("/auth/register", data, false);
    if (!res.success) {
      return { success: false, error: res.error?.message || "Error al registrarse" };
    }
    await tokenStorage.setTokens({
      accessToken: res.data.accessToken,
      refreshToken: res.data.refreshToken,
    });
    setState({ user: res.data.user, isLoading: false, isAuthenticated: true });
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    try {
      const tokens = await tokenStorage.getTokens();
      if (tokens?.refreshToken) {
        await api.post("/auth/logout", { refreshToken: tokens.refreshToken });
      }
    } catch {} finally {
      await tokenStorage.clearTokens();
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const res = await api.get<User>("/users/");
    if (res.success && res.data) {
      setState((s) => ({ ...s, user: res.data! }));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
