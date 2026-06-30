import { LiquidityFeature } from "./LiquidityFeature";

export class LiquidityCache {
  private readonly cache = new Map<string, LiquidityFeature>();

  set(feature: LiquidityFeature): void {
    this.cache.set(feature.symbol, feature);
  }

  get(symbol: string) {
    return this.cache.get(symbol);
  }

  values() {
    return [...this.cache.values()];
  }
}
