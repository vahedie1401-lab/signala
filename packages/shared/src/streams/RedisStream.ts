import { redis } from "../redis";

export class RedisStream {
  constructor(readonly stream: string) {}

  async publish<T>(data: T, maxLen = 10000): Promise<string> {
    const id = await redis.raw.xadd(
      this.stream,

      "MAXLEN",

      "~",

      maxLen,

      "*",

      "data",

      JSON.stringify(data),
    );

    if (!id) {
      throw new Error("XADD failed");
    }

    return id;
  }

  async read<T>(
    lastId = "$",

    block = 1000,

    count = 100,
  ) {
    const result = (await redis.raw.call(
      "XREAD",

      "BLOCK",

      block,

      "COUNT",

      count,

      "STREAMS",

      this.stream,

      lastId,
    )) as any;

    if (!result) {
      return [];
    }

    const output = [];

    for (const [, entries] of result) {
      for (const [id, values] of entries) {
        const index = values.indexOf("data");

        if (index === -1) {
          continue;
        }

        const json = values[index + 1];

        if (typeof json !== "string") {
          continue;
        }

        output.push({
          id,

          data: JSON.parse(json),
        });
      }
    }

    return output;
  }

  async group(group: string) {
    try {
      await redis.raw.xgroup(
        "CREATE",

        this.stream,

        group,

        "0",

        "MKSTREAM",
      );
    } catch {}
  }

  async ack(
    group: string,

    id: string,
  ) {
    return redis.raw.xack(
      this.stream,

      group,

      id,
    );
  }

  async pending(group: string) {
    return redis.raw.xpending(
      this.stream,

      group,
    );
  }

  async claim(
    group: string,

    consumer: string,

    minIdle: number,

    id: string,
  ) {
    return redis.raw.xclaim(
      this.stream,

      group,

      consumer,

      minIdle,

      id,
    );
  }
}
