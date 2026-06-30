export class ContextExpiration {
  constructor(private readonly ttl = 5000) {}

  expired(timestamp: number): boolean {
    return Date.now() - timestamp > this.ttl;
  }
}
