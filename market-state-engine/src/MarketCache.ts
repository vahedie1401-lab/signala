import { MarketFeature } from "./MarketFeature";

export class MarketCache {
  private readonly cache = new Map<string, MarketFeature>();

  set(feature: MarketFeature) {
    this.cache.set(
      feature.symbol,

      feature,
    );
  }

  get(symbol: string) {
    return this.cache.get(symbol);
  }
}
