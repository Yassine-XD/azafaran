import { useEffect } from "react";
import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import { Container } from "../components/Container";

const RELOAD_KEY = "azafaran:routeError:reloaded";

function describe(error: unknown): { title: string; detail: string } {
  if (isRouteErrorResponse(error)) {
    return {
      title: `${error.status} ${error.statusText || ""}`.trim(),
      detail: typeof error.data === "string" ? error.data : "",
    };
  }
  if (error instanceof Error) {
    return { title: error.name, detail: error.message };
  }
  return { title: "Error", detail: String(error ?? "") };
}

export default function RouteError() {
  const error = useRouteError();
  const { title, detail } = describe(error);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(RELOAD_KEY)) return;
    const looksLikeStaleAsset =
      detail.includes("is not valid JSON") ||
      detail.includes("Unexpected token") ||
      detail.includes("Failed to fetch dynamically imported module") ||
      detail.includes("Loading chunk") ||
      detail.includes("ChunkLoadError");
    if (!looksLikeStaleAsset) return;
    sessionStorage.setItem(RELOAD_KEY, "1");
    if ("caches" in window) {
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
    }
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => Promise.all(regs.map((r) => r.unregister())))
        .finally(() => window.location.reload());
      return;
    }
    window.location.reload();
  }, [detail]);

  useEffect(() => {
    console.error("[Azafaran landing] route error:", error);
  }, [error]);

  return (
    <main className="min-h-screen grid place-items-center bg-background text-foreground">
      <Container className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Azafaran
        </p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
          Algo no ha cargado bien
        </h1>
        <p className="mt-3 text-muted-foreground">
          Refresca la página para intentarlo de nuevo. Si el problema continúa,
          vuelve al inicio.
        </p>
        {detail ? (
          <p className="mt-4 break-words text-xs text-muted-foreground/80">
            <strong>{title}:</strong> {detail}
          </p>
        ) : null}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem(RELOAD_KEY);
              window.location.reload();
            }}
            className="inline-flex h-12 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
          >
            Reintentar
          </button>
          <Link
            to="/"
            className="inline-flex h-12 items-center rounded-full border border-border px-6 text-sm font-semibold text-foreground"
          >
            Volver al inicio
          </Link>
        </div>
      </Container>
    </main>
  );
}
