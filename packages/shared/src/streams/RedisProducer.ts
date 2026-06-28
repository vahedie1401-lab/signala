import type Redis from "ioredis";

export class RedisProducer {
  constructor(
    private readonly redis: Redis,
    private readonly stream: string,
  ) {}

  async publish(data: Record<string, unknown>): Promise<string> {
    const payload: string[] = [];

    for (const [key, value] of Object.entries(data)) {
      payload.push(key, typeof value === "string" ? value : JSON.stringify(value));
    }

    const id = await this.redis.xadd(this.stream, "*", ...payload);

    if (id === null) {
      throw new Error(`Failed to publish to stream "${this.stream}"`);
    }

    return id;
  }
}
