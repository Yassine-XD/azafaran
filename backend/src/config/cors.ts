import cors from "cors";
import { env } from "./env";

// Origins are matched literally against the browser's `Origin` header — no
// trailing-slash normalization. `Origin` headers never include a trailing
// slash, so values like `https://example.com` are correct.
const extraOrigins = (env.CORS_ORIGINS ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(
  new Set(
    [
      ...extraOrigins,
      env.CLIENT_URL,
      env.ADMIN_URL,
      "http://localhost:8081", // Expo Go
      "http://localhost:19006", // Expo web
      "http://localhost:5173", // Admin dashboard (local)
    ].filter(Boolean) as string[],
  ),
);

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
