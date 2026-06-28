import { logger } from "../logger";

import { redis } from "../redis";

import { sql } from "../postgres";

export function gracefulShutdown() {
  async function shutdown(signal: string) {
    logger.info(`${signal} received`);

    await redis.quit();

    await sql.end();

    process.exit(0);
  }

  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("SIGTERM", () => shutdown("SIGTERM"));
}
