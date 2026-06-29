import { randomUUID } from "node:crypto";

export class Trace {
  static create() {
    return {
      traceId: randomUUID(),

      correlationId: randomUUID(),
    };
  }
}
