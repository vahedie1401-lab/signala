import Redis from "ioredis";

import { config } from "../config";

import { logger } from "../logger";

export class RedisClient {
  private readonly client: Redis;

  constructor() {
    this.client = new Redis(config.redis.url, {
      lazyConnect: true,
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
    });

    this.client.on("connect", () => {
      logger.info("Redis connected");
    });

    this.client.on("error", (err: Error) => {
      logger.error(err);
    });
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async quit(): Promise<void> {
    await this.client.quit();
  }

  get raw(): Redis {
    return this.client;
  }
}

export const redis = new RedisClient();
