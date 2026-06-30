export class NotificationHistory {
  private readonly sent = new Set<string>();

  has(id: string) {
    return this.sent.has(id);
  }

  add(id: string) {
    this.sent.add(id);
  }
}
