import { env } from "./config/env.ts";
import { handleRequest } from "./app.ts";
import { logger } from "./utils/logger.ts";

logger.info("🏥 Starting TechBlitz Clinic Backend...");

const server = Bun.serve({
  port: env.PORT,
  fetch: handleRequest,
});

logger.info(`🚀 Server running at http://localhost:${server.port}`);
logger.info(`📋 Environment: ${env.NODE_ENV}`);
logger.info(`🔗 Health check: http://localhost:${server.port}/health`);

// Graceful shutdown
process.on("SIGINT", () => {
  logger.info("Shutting down server...");
  server.stop();
  process.exit(0);
});

process.on("SIGTERM", () => {
  logger.info("Shutting down server...");
  server.stop();
  process.exit(0);
});
