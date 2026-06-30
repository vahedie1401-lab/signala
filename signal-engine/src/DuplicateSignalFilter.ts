import { SignalFeature } from "./SignalFeature";

export class DuplicateSignalFilter {
  private readonly cache = new Map<string, SignalFeature>();

  accept(signal: SignalFeature): boolean {
    const last = this.cache.get(signal.symbol);

    if (!last) {
      this.cache.set(
        signal.symbol,

        signal,
      );

      return true;
    }

    if (last.direction === signal.direction && Math.abs(last.score - signal.score) < 3) {
      return false;
    }

    this.cache.set(
      signal.symbol,

      signal,
    );

    return true;
  }
}
