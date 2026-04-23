import cors from "cors";
import { env } from "./env";

// Expand a configured URL (e.g. https://azafaran.es) into the set of
// origins that should be treated as equivalent: apex + www, http + https.
// Keeps localhost entries as-is.
function expandOrigins(url: string | undefined): string[] {
  if (!url) return [];
  try {
    const u = new URL(url);
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") {
      return [u.origin];
    }
    const apex = u.hostname.startsWith("www.")
      ? u.hostname.slice(4)
      : u.hostname;
    const out = new Set<string>();
    for (const host of [apex, `www.${apex}`]) {
      for (const proto of ["http:", "https:"]) {
        const v = new URL(url);
        v.protocol = proto;
        v.hostname = host;
        out.add(v.origin);
      }
    }
    return [...out];
  } catch {
    return [url];
  }
}

const allowedOrigins = [
  ...expandOrigins(env.CLIENT_URL),
  ...expandOrigins(env.ADMIN_URL),
  "http://localhost:8081", // Expo Go
  "http://localhost:19006", // Expo web
  "http://localhost:5173", // Admin dashboard (local)
];

export const corsOptions = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-platform"],
});
