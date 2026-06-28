import { EngineManager } from "./EngineManager";
import { gracefulShutdown } from "../shutdown/GracefulShutdown";
import { logger } from "../logger";

export class LifecycleManager {
  constructor(private readonly manager: EngineManager) {}

  listen() {
    process.on("SIGINT", () => this.shutdown());

    process.on("SIGTERM", () => this.shutdown());
  }

  private async shutdown() {
    logger.warn("Shutdown signal received");

    await this.manager.stop();

    await gracefulShutdown();
  }
}
