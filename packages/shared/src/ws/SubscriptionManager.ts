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

  values(): string[] {
    return [...this.subscriptions];
  }

  get size(): number {
    return this.subscriptions.size;
  }
}
