import type Redis from "ioredis";

type RedisStreamEntry = [id: string, values: string[]];

type RedisStreamResponse = [stream: string, messages: RedisStreamEntry[]];

export interface StreamMessage {
  id: string;
  values: Record<string, string>;
}

export class RedisConsumer {
  constructor(
    private readonly redis: Redis,

    private readonly stream: string,
  ) {}

  async read(group: string, consumer: string, count = 100): Promise<StreamMessage[]> {
    const res = await this.redis.xreadgroup(
      "GROUP",
      group,
      consumer,
      "COUNT",
      count,
      "BLOCK",
      1000,
      "STREAMS",
      this.stream,
      ">",
    );

    if (!res) {
      return [];
    }

    const result = res as RedisStreamResponse[];

    const stream = result[0];

    if (!stream) {
      return [];
    }

    const [, messages] = stream;

    const output: StreamMessage[] = [];

    //const [, messages] = res[0];

    for (const [id, values] of messages) {
      const obj: Record<string, string> = {};

      for (let i = 0; i < values.length; i += 2) {
        obj[values[i]!] = values[i + 1]!;
      }

      output.push({
        id,
        values: obj,
      });
    }

    return output;
  }

  async ack(group: string, id: string) {
    await this.redis.xack(
      this.stream,

      group,

      id,
    );
  }
}
