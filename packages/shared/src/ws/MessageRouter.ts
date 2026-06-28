import type { MessageHandler } from "./types";

export class MessageRouter {
  private readonly handlers = new Set<MessageHandler>();

  on(handler: MessageHandler): void {
    this.handlers.add(handler);
  }

  off(handler: MessageHandler): void {
    this.handlers.delete(handler);
  }

  emit(data: unknown): void {
    for (const handler of this.handlers) {
      handler(data);
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}
