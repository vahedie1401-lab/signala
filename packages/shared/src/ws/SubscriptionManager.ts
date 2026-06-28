export interface SubscriptionRequest {
  stream: string;
}

export class SubscriptionManager {
  private readonly subscriptions = new Set<string>();

  add(stream: string): void {
    this.subscriptions.add(stream);
  }

  remove(stream: string): void {
    this.subscriptions.delete(stream);
  }

  has(stream: string): boolean {
    return this.subscriptions.has(stream);
  }

  clear(): void {
    this.subscriptions.clear();
  }

  size(): number {
    return this.subscriptions.size;
  }

  values(): string[] {
    return [...this.subscriptions];
  }

  subscribeMessage() {
    return {
      method: "SUBSCRIBE",
      params: this.values(),
      id: Date.now(),
    };
  }

  unsubscribeMessage(streams: string[]) {
    return {
      method: "UNSUBSCRIBE",
      params: streams,
      id: Date.now(),
    };
  }
}
