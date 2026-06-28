import { logger } from "../logger";

export interface EngineHealth {
  running: boolean;
  startedAt: number;
  processed: number;
  errors: number;
}

export abstract class BaseEngine {
  protected readonly health: EngineHealth = {
    running: false,
    startedAt: 0,
    processed: 0,
    errors: 0,
  };

  async boot(): Promise<void> {
    logger.info(`${this.constructor.name} booting...`);

    this.health.running = true;

    this.health.startedAt = Date.now();

    await this.start();

    logger.info(`${this.constructor.name} started`);
  }

  async shutdown(): Promise<void> {
    logger.info(`${this.constructor.name} stopping...`);

    this.health.running = false;

    await this.stop();

    logger.info(`${this.constructor.name} stopped`);
  }

  protected processed() {
    this.health.processed++;
  }

  protected error() {
    this.health.errors++;
  }

  status(): EngineHealth {
    return { ...this.health };
  }

  abstract start(): Promise<void>;

  abstract stop(): Promise<void>;
}

// export abstract class BaseEngine {
//   abstract start(): Promise<void>;

//   abstract stop(): Promise<void>;

//   abstract health(): Promise<boolean>;

//   abstract metrics(): Record<string, unknown>;
// }
