import { SignalFeature } from "./SignalFeature";

export class SignalCache {
  private readonly cache = new Map<string, SignalFeature>();

  set(signal: SignalFeature) {
    this.cache.set(
      signal.symbol,

      signal,
    );
  }

  get(symbol: string) {
    return this.cache.get(symbol);
  }
}
