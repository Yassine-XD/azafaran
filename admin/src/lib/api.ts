export const BASE = "http://187.77.169.76/api/v1";

type Tokens = { accessToken: string; refreshToken: string };

export function getTokens(): Tokens | null {
  const raw = localStorage.getItem("admin_tokens");
  return raw ? JSON.parse(raw) : null;
}

export function setTokens(t: Tokens) {
  localStorage.setItem("admin_tokens", JSON.stringify(t));
}

export function clearTokens() {
  localStorage.removeItem("admin_tokens");
}

let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const t = getTokens();
  if (!t?.refreshToken) return null;
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: t.refreshToken }),
    });
    if (!res.ok) {
      clearTokens();
      return null;
    }
    const json = await res.json();
    setTokens({
      accessToken: json.data.accessToken,
      refreshToken: json.data.refreshToken,
    });
    return json.data.accessToken;
  } catch {
    clearTokens();
    return null;
  }
}

export async function api<T = any>(
  path: string,
  opts: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<{
  success: boolean;
  data?: T;
  meta?: any;
  error?: { message: string; code: string };
}> {
  const { method = "GET", body, auth = true } = opts;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const t = getTokens();
    if (t?.accessToken) headers["Authorization"] = `Bearer ${t.accessToken}`;
  }

  let res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth) {
    if (!refreshing)
      refreshing = refreshAccessToken().finally(() => {
        refreshing = null;
      });
    const newToken = await refreshing;
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(`${BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    }
  }

  return res.json();
}

api.get = <T = any>(path: string) => api<T>(path);
api.post = <T = any>(path: string, body?: unknown) =>
  api<T>(path, { method: "POST", body });
api.put = <T = any>(path: string, body?: unknown) =>
  api<T>(path, { method: "PUT", body });
api.patch = <T = any>(path: string, body?: unknown) =>
  api<T>(path, { method: "PATCH", body });
api.del = <T = any>(path: string) => api<T>(path, { method: "DELETE" });
