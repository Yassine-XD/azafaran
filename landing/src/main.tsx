import { ViteReactSSG } from "vite-react-ssg";
import { routes } from "./routes";
import "./index.css";

if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((regs) => {
      if (regs.length === 0) return;
      Promise.all(regs.map((r) => r.unregister())).then(() => {
        if ("caches" in window) {
          caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
        }
      });
    })
    .catch(() => {});
}

export const createRoot = ViteReactSSG({ routes });
