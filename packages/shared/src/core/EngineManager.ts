import { BaseEngine } from "./BaseEngine";
import { logger } from "../logger";

export class EngineManager {
  private readonly engines = new Map<string, BaseEngine>();

  register(engine: BaseEngine) {
    const name = engine.constructor.name;

    if (this.engines.has(name)) {
      throw new Error(`${name} already registered`);
    }

    this.engines.set(name, engine);

    logger.info(`${name} registered`);
  }

  get<T extends BaseEngine>(name: string): T | undefined {
    return this.engines.get(name) as T | undefined;
  }

  list() {
    return [...this.engines.keys()];
  }

  async start() {
    logger.info("Starting engines...");

    for (const engine of this.engines.values()) {
      await engine.boot();
    }

    logger.info("All engines started");
  }

  async stop() {
    logger.info("Stopping engines...");

    const engines = [...this.engines.values()].reverse();

    for (const engine of engines) {
      await engine.shutdown();
    }

    logger.info("All engines stopped");
  }

  health() {
    return [...this.engines.entries()].map(([name, engine]) => ({
      name,

      ...engine.status(),
    }));
  }
}
