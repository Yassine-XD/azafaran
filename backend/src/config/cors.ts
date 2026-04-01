import cors from "cors";
import { env } from "./env";

const allowedOrigins = [
  env.CLIENT_URL,
  "http://localhost:8081", // Expo Go
  "http://localhost:19006", // Expo web
  "http://localhost:5173", // Admin dashboard
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
