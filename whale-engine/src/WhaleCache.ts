import { WhaleSignal } from "./WhaleSignal";

export class WhaleCache {
  private readonly cache = new Map<string, WhaleSignal>();

  set(signal: WhaleSignal) {
    this.cache.set(signal.symbol, signal);
  }

  get(symbol: string) {
    return this.cache.get(symbol);
  }

  values() {
    return [...this.cache.values()];
  }
}
