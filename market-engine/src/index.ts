// src/index.ts

import { gracefulShutdown, logger } from "@signala/shared";
import dotenv from "dotenv";

import { MarketEngine } from "./MarketEngine";

dotenv.config();

async function start() {
  logger.info("Starting Market Engine service...");

  const engine = new MarketEngine();

  gracefulShutdown();

  process.on("SIGINT", () => void engine.stop());

  process.on("SIGTERM", () => void engine.stop());

  await engine.start();
}

start().catch((error) => {
  logger.error({ error }, "MarketEngine failed to start");

  process.exit(1);
});
