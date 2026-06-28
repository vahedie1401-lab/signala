import type Redis from "ioredis";

export class RedisGroup {
  constructor(
    private readonly redis: Redis,
    private readonly stream: string,
  ) {}

  async create(group: string): Promise<void> {
    try {
      await this.redis.xgroup("CREATE", this.stream, group, "$", "MKSTREAM");
    } catch (error) {
      // BUSYGROUP یعنی Group قبلاً ساخته شده است.
      if (!(error instanceof Error) || !error.message.includes("BUSYGROUP")) {
        throw error;
      }
    }
  }
}
