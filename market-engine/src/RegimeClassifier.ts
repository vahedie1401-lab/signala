import type { MarketDerivatives, MarketLiquidity, MarketRegime } from "@signala/shared";

import { RollingWindow } from "../utils/RollingWindow";

const VOLATILITY_THRESHOLDS = {
  low: 0.5,

  medium: 1.5,

  high: 4,

  // anything above `high` => extreme
};

/**
 * Classifies current market regime (volatility / trend / risk) from a
 * rolling price window plus derivatives + liquidity context.
 *
 * This is intentionally simple and deterministic (not ML-based) so it is
 * auditable and cheap to run on every symbol every cycle. Baseline Engine
 * can later replace/augment this with a learned regime model that publishes
 * to the same MarketRegime contract without Market Engine changing shape.
 */
export class RegimeClassifier {
  classify(
    symbol: string,

    priceWindow: RollingWindow,

    derivatives: MarketDerivatives | null,

    liquidity: MarketLiquidity | null,
  ): MarketRegime {
    const volatilityPercent = this.relativeVolatility(priceWindow);

    const volatilityRegime = this.classifyVolatility(volatilityPercent);

    const trendRegime = this.classifyTrend(priceWindow);

    const riskLevel = this.classifyRisk(volatilityRegime, derivatives, liquidity);

    return {
      symbol,

      volatilityRegime,

      trendRegime,

      riskLevel,

      regimeChangeProbability: this.estimateRegimeChangeProbability(
        volatilityRegime,

        trendRegime,

        derivatives,
      ),

      timestamp: Date.now(),
    };
  }

  /**
   * Standard deviation of returns expressed as a percentage of mean price.
   * A simple, robust proxy for realized volatility without needing OHLC.
   */
  private relativeVolatility(window: RollingWindow): number {
    const mean = window.mean();

    if (mean === 0) return 0;

    return (window.stdDev() / mean) * 100;
  }

  private classifyVolatility(volatilityPercent: number): MarketRegime["volatilityRegime"] {
    if (volatilityPercent < VOLATILITY_THRESHOLDS.low) return "low";

    if (volatilityPercent < VOLATILITY_THRESHOLDS.medium) return "medium";

    if (volatilityPercent < VOLATILITY_THRESHOLDS.high) return "high";

    return "extreme";
  }

  private classifyTrend(window: RollingWindow): MarketRegime["trendRegime"] {
    const change = window.percentChange();

    if (change > 5) return "strong_uptrend";

    if (change > 1) return "uptrend";

    if (change < -5) return "strong_downtrend";

    if (change < -1) return "downtrend";

    return "range";
  }

  private classifyRisk(
    volatilityRegime: MarketRegime["volatilityRegime"],

    derivatives: MarketDerivatives | null,

    liquidity: MarketLiquidity | null,
  ): MarketRegime["riskLevel"] {
    let riskPoints = 0;

    if (volatilityRegime === "high") riskPoints += 1;

    if (volatilityRegime === "extreme") riskPoints += 2;

    if (derivatives && Math.abs(derivatives.fundingRate) >= 0.0015) riskPoints += 1;

    if (derivatives && derivatives.liquidationBiasSide !== "balanced") {
      riskPoints += derivatives.liquidationVolume1h > 5_000_000 ? 2 : 1;
    }

    if (liquidity && (liquidity.health === "poor" || liquidity.health === "fair")) {
      riskPoints += 1;
    }

    if (riskPoints >= 4) return "critical";

    if (riskPoints >= 3) return "high";

    if (riskPoints >= 1) return "medium";

    return "low";
  }

  private estimateRegimeChangeProbability(
    volatilityRegime: MarketRegime["volatilityRegime"],

    trendRegime: MarketRegime["trendRegime"],

    derivatives: MarketDerivatives | null,
  ): number {
    let probability = 0.1;

    if (volatilityRegime === "extreme") probability += 0.35;
    else if (volatilityRegime === "high") probability += 0.2;

    if (trendRegime === "strong_uptrend" || trendRegime === "strong_downtrend") {
      probability += 0.15;
    }

    if (derivatives && Math.abs(derivatives.fundingRate) >= 0.0015) {
      probability += 0.15;
    }

    if (derivatives && derivatives.openInterestTrend !== "stable") {
      probability += 0.1;
    }

    return Math.min(probability, 0.95);
  }
}
