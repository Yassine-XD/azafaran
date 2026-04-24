import AsyncStorage from "@react-native-async-storage/async-storage";

// Resolved from Expo public env at build time. Override with
// `EXPO_PUBLIC_API_HOST` in `.env` / EAS secrets. Defaults to the public
// prod HTTPS endpoint so a misconfigured build still talks to production
// instead of a bare IP over cleartext HTTP.
const DEFAULT_API_HOST = "https://www.azafaran.es";
export const API_HOST: string =
  process.env.EXPO_PUBLIC_API_HOST || DEFAULT_API_HOST;
export const API_BASE_URL = `${API_HOST}/api/v1`;

let currentLang = "es";

export function setApiLang(lang: string) {
  currentLang = lang;
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  requireAuth?: boolean;
};

type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

let tokenCache: TokenPair | null = null;
let refreshPromise: Promise<string | null> | null = null;

export const tokenStorage = {
  async getTokens(): Promise<TokenPair | null> {
    if (tokenCache) return tokenCache;
    try {
      const raw = await AsyncStorage.getItem("auth_tokens");
      if (raw) {
        tokenCache = JSON.parse(raw);
        return tokenCache;
      }
    } catch {}
    return null;
  },

  async setTokens(tokens: TokenPair): Promise<void> {
    tokenCache = tokens;
    await AsyncStorage.setItem("auth_tokens", JSON.stringify(tokens));
  },

  async clearTokens(): Promise<void> {
    tokenCache = null;
    await AsyncStorage.removeItem("auth_tokens");
  },
};

async function refreshAccessToken(): Promise<string | null> {
  const tokens = await tokenStorage.getTokens();
  if (!tokens?.refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });

    if (!res.ok) {
      await tokenStorage.clearTokens();
      return null;
    }

    const json = await res.json();
    const newTokens: TokenPair = {
      accessToken: json.data.accessToken,
      refreshToken: json.data.refreshToken,
    };
    await tokenStorage.setTokens(newTokens);
    return newTokens.accessToken;
  } catch {
    await tokenStorage.clearTokens();
    return null;
  }
}

export async function api<T = any>(
  path: string,
  options: RequestOptions = {},
): Promise<{
  success: boolean;
  data?: T;
  meta?: any;
  error?: { message: string; code: string };
}> {
  const { method = "GET", body, headers = {}, requireAuth = true } = options;

  try {
    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Lang": currentLang,
      ...headers,
    };

    if (requireAuth) {
      const tokens = await tokenStorage.getTokens();
      if (tokens?.accessToken) {
        requestHeaders["Authorization"] = `Bearer ${tokens.accessToken}`;
      }
    }

    let res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    // If 401 and we have a refresh token, try refreshing
    if (res.status === 401 && requireAuth) {
      // Deduplicate concurrent refresh calls
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      const newToken = await refreshPromise;

      if (newToken) {
        requestHeaders["Authorization"] = `Bearer ${newToken}`;
        res = await fetch(`${API_BASE_URL}${path}`, {
          method,
          headers: requestHeaders,
          body: body ? JSON.stringify(body) : undefined,
        });
      }
    }

    const json = await res.json();
    return json;
  } catch {
    return {
      success: false,
      error: { message: "Error de conexión. Comprueba tu red.", code: "NETWORK_ERROR" },
    };
  }
}

// Convenience methods
api.get = <T = any>(path: string, requireAuth = true) =>
  api<T>(path, { requireAuth });

api.post = <T = any>(path: string, body?: unknown, requireAuth = true) =>
  api<T>(path, { method: "POST", body, requireAuth });

api.put = <T = any>(path: string, body?: unknown, requireAuth = true) =>
  api<T>(path, { method: "PUT", body, requireAuth });

api.patch = <T = any>(path: string, body?: unknown, requireAuth = true) =>
  api<T>(path, { method: "PATCH", body, requireAuth });

api.delete = <T = any>(path: string, requireAuth = true) =>
  api<T>(path, { method: "DELETE", requireAuth });

export async function apiForm<T = any>(
  path: string,
  formData: FormData,
  method: "POST" | "PATCH" | "PUT" = "POST",
): Promise<{
  success: boolean;
  data?: T;
  meta?: any;
  error?: { message: string; code: string };
}> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "X-Lang": currentLang,
    };

    const tokens = await tokenStorage.getTokens();
    if (tokens?.accessToken)
      headers["Authorization"] = `Bearer ${tokens.accessToken}`;

    let res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: formData as any,
    });

    if (res.status === 401) {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      const newToken = await refreshPromise;
      if (newToken) {
        headers["Authorization"] = `Bearer ${newToken}`;
        res = await fetch(`${API_BASE_URL}${path}`, {
          method,
          headers,
          body: formData as any,
        });
      }
    }

    return await res.json();
  } catch {
    return {
      success: false,
      error: { message: "Error de conexión. Comprueba tu red.", code: "NETWORK_ERROR" },
    };
  }
}
