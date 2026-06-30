export class SignalCooldown {
  private readonly cache = new Map<string, number>();

  constructor(private readonly cooldown = 60_000) {}

  allow(symbol: string): boolean {
    const last = this.cache.get(symbol);

    if (!last) {
      this.cache.set(symbol, Date.now());

      return true;
    }

    if (Date.now() - last > this.cooldown) {
      this.cache.set(symbol, Date.now());

      return true;
    }

    return false;
  }
}
