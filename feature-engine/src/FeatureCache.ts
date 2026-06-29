import { FeatureVector } from "./FeatureVector";

export class FeatureCache {
  private readonly cache = new Map<string, FeatureVector>();

  set(feature: FeatureVector): void {
    this.cache.set(feature.symbol, feature);
  }

  get(symbol: string): FeatureVector | undefined {
    return this.cache.get(symbol);
  }

  values(): FeatureVector[] {
    return [...this.cache.values()];
  }

  clear(): void {
    this.cache.clear();
  }
}
