import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { BASE, getTokens } from "../lib/api";
import { useAuth } from "./AuthContext";

export type SseStatus = "connecting" | "live" | "reconnecting";

export type SseEvent = {
  event: string;
  data: any;
  receivedAt: string;
};

type Handler = (data: any) => void;

type Ctx = {
  status: SseStatus;
  recent: SseEvent[];
  on: (event: string, handler: Handler) => () => void;
};

const SseContext = createContext<Ctx | null>(null);

const RECENT_BUFFER = 20;

export function SseProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [status, setStatus] = useState<SseStatus>("connecting");
  const [recent, setRecent] = useState<SseEvent[]>([]);
  const handlersRef = useRef<Map<string, Set<Handler>>>(new Map());
  const aliveRef = useRef(false);

  const on = (event: string, handler: Handler) => {
    let set = handlersRef.current.get(event);
    if (!set) {
      set = new Set();
      handlersRef.current.set(event, set);
    }
    set.add(handler);
    return () => {
      set!.delete(handler);
    };
  };

  useEffect(() => {
    if (!user) return;
    aliveRef.current = true;
    let controller = new AbortController();
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const dispatch = (event: string, data: any) => {
      const set = handlersRef.current.get(event);
      if (set) {
        for (const h of set) {
          try {
            h(data);
          } catch {
            // handler error — don't break the stream
          }
        }
      }
      setRecent((prev) => {
        const next = [
          { event, data, receivedAt: new Date().toISOString() },
          ...prev,
        ];
        return next.slice(0, RECENT_BUFFER);
      });
    };

    const run = async () => {
      const tokens = getTokens();
      if (!tokens?.accessToken) {
        setStatus("reconnecting");
        scheduleReconnect();
        return;
      }
      setStatus((s) => (s === "live" ? s : "connecting"));
      try {
        const res = await fetch(`${BASE}/admin/events`, {
          headers: { Authorization: `Bearer ${tokens.accessToken}` },
          signal: controller.signal,
        });
        if (!res.ok || !res.body) {
          setStatus("reconnecting");
          scheduleReconnect();
          return;
        }
        setStatus("live");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (aliveRef.current) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split("\n\n");
          buffer = chunks.pop() ?? "";
          for (const chunk of chunks) {
            const lines = chunk.split("\n");
            const evtLine = lines.find((l) => l.startsWith("event:"));
            const dataLine = lines.find((l) => l.startsWith("data:"));
            if (!evtLine || !dataLine) continue;
            const event = evtLine.slice(6).trim();
            try {
              const data = JSON.parse(dataLine.slice(5).trim());
              dispatch(event, data);
            } catch {
              // ignore malformed event
            }
          }
        }
      } catch {
        // aborted or network error
      }
      if (aliveRef.current) {
        setStatus("reconnecting");
        scheduleReconnect();
      }
    };

    const scheduleReconnect = () => {
      if (!aliveRef.current) return;
      reconnectTimer = setTimeout(() => {
        controller = new AbortController();
        run();
      }, 5000);
    };

    run();

    return () => {
      aliveRef.current = false;
      controller.abort();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [user]);

  return (
    <SseContext.Provider value={{ status, recent, on }}>
      {children}
    </SseContext.Provider>
  );
}

export function useSse() {
  const ctx = useContext(SseContext);
  if (!ctx) throw new Error("useSse must be used within SseProvider");
  return ctx;
}

export function useSseEvent(event: string, handler: Handler) {
  const { on } = useSse();
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    return on(event, (d) => ref.current(d));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);
}
