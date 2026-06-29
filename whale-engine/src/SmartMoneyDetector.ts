import { FeatureVector } from "@signala/feature-engine";

export class SmartMoneyDetector {
  detect(feature: FeatureVector): number {
    let score = 0;

    if (feature.deltaVolume > 0) score += 20;

    if (feature.price > feature.vwap) score += 15;

    if (feature.ema20 > feature.ema50) score += 15;

    if (feature.rsi > 60) score += 10;

    if (feature.macd > 0) score += 15;

    if (feature.volatility < feature.atr * 1.5) score += 10;

    if (feature.momentum > 0) score += 15;

    return Math.min(score, 100);
  }
}
