import "dotenv/config"; // Load .env FIRST before anything else
import { connectDatabase, pool } from "./src/config/database";
import { env } from "./src/config/env";
import { logger } from "./src/utils/logger";
import app from "./app";

const PORT = parseInt(env.PORT, 10);

async function startServer() {
  try {
    // 1. Validate env vars (happens in env.ts import above)
    logger.info("Starting Carnes Alhambra API...");

    // 2. Connect to database
    await connectDatabase();

    // 3. Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📍 Environment: ${env.NODE_ENV}`);
      logger.info(`🏥 Health check: http://localhost:${PORT}/api/v1/health`);
    });

    // ─── Graceful shutdown ──────────────────────────
    // When Ctrl+C or container stops, finish in-flight requests
    // before closing DB connections

    const shutdown = async (signal: string) => {
      logger.info(`${signal} received — shutting down gracefully`);

      server.close(async () => {
        logger.info("HTTP server closed");

        try {
          await pool.end();
          logger.info("Database pool closed");
          process.exit(0);
        } catch (error) {
          logger.error("Error closing database pool:", error);
          process.exit(1);
        }
      });

      // Force exit after 10s if graceful shutdown hangs
      setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM")); // Docker stop
    process.on("SIGINT", () => shutdown("SIGINT")); // Ctrl+C

    // Handle uncaught errors — log and exit
    // (Let your process manager restart the server)
    process.on("uncaughtException", (error) => {
      logger.error("Uncaught exception:", error);
      process.exit(1);
    });

    process.on("unhandledRejection", (reason) => {
      logger.error("Unhandled rejection:", reason);
      process.exit(1);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
