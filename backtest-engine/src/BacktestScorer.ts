import type { FeatureVector } from "@signala/feature-engine";

import type { BacktestDirection } from "./BacktestPosition";

export interface ScoredFeature {
  score: number;

  direction: BacktestDirection;
}

/**
 * Confluence scorer used by the backtest engine.
 *
 * It mirrors the indicator-based checks in signal-engine's SignalScorer, but
 * intentionally omits whale/liquidity/market-state inputs since a historical
 * trade-print replay has no access to those live engines. Scores are 0-100.
 */
export class BacktestScorer {
  score(feature: FeatureVector): ScoredFeature {
    const bullish = feature.ema20 > feature.ema50;

    let score = 0;

    if (bullish && feature.rsi > 55) score += 20;
    if (!bullish && feature.rsi < 45) score += 20;

    if (bullish && feature.macd > feature.macdSignal) score += 20;
    if (!bullish && feature.macd < feature.macdSignal) score += 20;

    if (bullish && feature.macdHistogram > 0) score += 15;
    if (!bullish && feature.macdHistogram < 0) score += 15;

    if (bullish && feature.momentum > 0) score += 15;
    if (!bullish && feature.momentum < 0) score += 15;

    if (bullish && feature.deltaVolume > 0) score += 15;
    if (!bullish && feature.deltaVolume < 0) score += 15;

    if (bullish && feature.price > feature.vwap) score += 15;
    if (!bullish && feature.price < feature.vwap) score += 15;

    return {
      score: Math.min(100, score),
      direction: bullish ? "LONG" : "SHORT",
    };
  }
}
