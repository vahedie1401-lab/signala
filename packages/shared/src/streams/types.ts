import type { Redis } from "ioredis";

export interface StreamMessage<T> {
  id: string;
  data: T;
}

export interface PublishOptions {
  maxLen?: number;
}

export interface ConsumerOptions {
  block?: number;
  count?: number;
}

export interface GroupOptions {
  mkStream?: boolean;
}

export interface StreamConfig {
  client: Redis;
  stream: string;
}
