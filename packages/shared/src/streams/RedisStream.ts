import { redis } from "../redis";

import { RedisProducer } from "./RedisProducer";

import { RedisConsumer } from "./RedisConsumer";

import { RedisGroup } from "./RedisGroup";

export class RedisStream {
  readonly producer;

  readonly consumer;

  readonly group;

  constructor(readonly stream: string) {
    this.producer = new RedisProducer(redis, stream);

    this.consumer = new RedisConsumer(redis, stream);

    this.group = new RedisGroup(redis, stream);
  }
}
