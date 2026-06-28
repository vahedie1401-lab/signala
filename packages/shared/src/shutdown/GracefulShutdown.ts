import { redis } from "../redis";
import { sql } from "../postgres";
import { logger } from "../logger";

export function gracefulShutdown() {
  async function shutdown() {
    logger.info("Gracefully shutting down...");

    try {
      await redis.quit();
    } catch {}

    try {
      await sql.end();
    } catch {}

    process.exit(0);
  }

  process.on("SIGINT", shutdown);

  process.on("SIGTERM", shutdown);
}
