import { randomUUID } from "node:crypto";

export class Correlation {
  static create(): string {
    return randomUUID();
  }

  static child(parentId: string): string {
    return `${parentId}.${randomUUID().slice(0, 8)}`;
  }

  static root() {
    return {
      traceId: randomUUID(),
      correlationId: randomUUID(),
    };
  }
}
