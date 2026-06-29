// export interface StreamMessage<T = unknown> {
//   id: string;

import { StreamMessage } from "./RedisConsumer";

//   values: Record<string, string>;
// }

export function parsePayload<T>(message: StreamMessage): T {
  const payload = message.values["payload"];

  if (!payload) {
    throw new Error(`Stream message ${message.id} does not contain payload`);
  }

  return JSON.parse(payload) as T;
}
