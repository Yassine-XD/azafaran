import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { corsOptions } from "./config/cors";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import routes from "./routes/index";
import { logger } from "./utils/logger";
import { env } from "./config/env";

const app = express();

// ─── Security middleware ─────────────────────────────
app.use(helmet());
app.use(corsOptions);

// ─── Global rate limiter ─────────────────────────────
// Auth routes have their own stricter limiter
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // 300 requests per 15min per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: { message: "Demasiadas peticiones", code: "RATE_LIMITED" },
    },
  }),
);

// ─── Body parsers ────────────────────────────────────
// Stripe webhook needs the raw Buffer — skip JSON parsing for that path
app.use((req, res, next) => {
  if (req.originalUrl === "/api/v1/payments/webhook") {
    return next();
  }
  express.json({ limit: "10mb" })(req, res, next);
});
app.use(express.urlencoded({ extended: true }));

// ─── Request logging ─────────────────────────────────
if (env.NODE_ENV !== "test") {
  app.use(
    morgan("combined", {
      stream: { write: (message) => logger.info(message.trim()) },
    }),
  );
}

// ─── API Routes ──────────────────────────────────────
app.use("/api/v1", routes);

// ─── Error handling (must be last) ───────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
