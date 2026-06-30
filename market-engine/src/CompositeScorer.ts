import type {
  FearGreedIndex,
  LongShortRatio,
  MarketDerivatives,
  MarketLiquidity,
  MarketRegime,
} from "@signala/shared";

export interface CompositeScore {
  bullishScore: number;

  bearishScore: number;
}

/**
 * Combines all Market Engine sources into a single bullish/bearish
 * composite score (0-100 each, independent axes - both can be elevated
 * during high uncertainty/volatility).
 *
 * This score is consumed by Signal Engine as one input among several
 * (alongside technical Features and Baseline regime) - it is NOT a trading
 * decision by itself.
 */
export class CompositeScorer {
  score(
    derivatives: MarketDerivatives | null,

    liquidity: MarketLiquidity | null,

    regime: MarketRegime,

    fearGreed: FearGreedIndex | null,

    longShort: LongShortRatio | null,
  ): CompositeScore {
    let bullish = 0;

    let bearish = 0;

    // -- Derivatives signals --
    if (derivatives) {
      // Negative funding = shorts paying longs = short-heavy positioning,
      // often a contrarian bullish signal (squeeze potential).
      if (derivatives.fundingRate < -0.0005) bullish += 15;

      if (derivatives.fundingRate > 0.0005) bearish += 15;

      if (derivatives.fundingRate < -0.0015) bullish += 10; // extreme

      if (derivatives.fundingRate > 0.0015) bearish += 10; // extreme

      if (derivatives.openInterestTrend === "rising") {
        // Rising OI confirms the direction of the prevailing liquidation bias
        if (derivatives.liquidationBiasSide === "short") bullish += 10;

        if (derivatives.liquidationBiasSide === "long") bearish += 10;
      }

      if (
        derivatives.liquidationBiasSide === "long" &&
        derivatives.liquidationVolume1h > 1_000_000
      ) {
        bearish += 15; // cascade of long liquidations = forced selling
      }

      if (
        derivatives.liquidationBiasSide === "short" &&
        derivatives.liquidationVolume1h > 1_000_000
      ) {
        bullish += 15; // cascade of short liquidations = forced buying
      }

      if (derivatives.longShortRatio > 2) bearish += 10; // crowded long = squeeze risk

      if (derivatives.longShortRatio < 0.5) bullish += 10; // crowded short = squeeze risk
    }

    // -- Liquidity signals --
    if (liquidity) {
      if (liquidity.imbalance > 0.2) bullish += 10; // bid-heavy book

      if (liquidity.imbalance < -0.2) bearish += 10; // ask-heavy book

      if (liquidity.buyWall && liquidity.buyWall.distancePercent < 0.5) bullish += 10;

      if (liquidity.sellWall && liquidity.sellWall.distancePercent < 0.5) bearish += 10;

      if (liquidity.health === "poor") {
        bullish *= 0.85; // discount confidence in thin liquidity regardless of direction

        bearish *= 0.85;
      }
    }

    // -- Sentiment signals (contrarian at extremes) --
    if (fearGreed) {
      if (fearGreed.classification === "extreme_fear") bullish += 10;

      if (fearGreed.classification === "extreme_greed") bearish += 10;
    }

    // -- Long/Short account ratio (contrarian) --
    if (longShort) {
      if (longShort.longShortRatio > 1.5) bearish += 5;

      if (longShort.longShortRatio < 0.67) bullish += 5;
    }

    // -- Regime adjustment --
    if (regime.riskLevel === "critical") {
      bullish *= 0.7;

      bearish *= 0.7;
    }

    return {
      bullishScore: Math.min(Math.round(bullish), 100),

      bearishScore: Math.min(Math.round(bearish), 100),
    };
  }
}
