import { MarketFeature, MarketState } from "./MarketFeature";

import { TrendDetector } from "./TrendDetector";

import { RangeDetector } from "./RangeDetector";

import { ExpansionDetector } from "./ExpansionDetector";

import { CompressionDetector } from "./CompressionDetector";

import { VolatilityDetector } from "./VolatilityDetector";

import { MarketStateClassifier } from "./MarketStateClassifier";

import { MarketScore } from "./MarketScore";

export class MarketStateAnalyzer {
  readonly trend = new TrendDetector();

  readonly range = new RangeDetector();

  readonly expansion = new ExpansionDetector();

  readonly compression = new CompressionDetector();

  readonly volatility = new VolatilityDetector();

  readonly classifier = new MarketStateClassifier();

  readonly score = new MarketScore();

  analyze(feature: {
    symbol: string;

    exchange: string;

    timestamp: number;

    ema20: number;

    ema50: number;

    macd: number;

    atr: number;

    price: number;

    adx: number;

    liquidity: number;
  }): MarketFeature {
    const trend = this.trend.detect(
      feature.ema20,

      feature.ema50,

      feature.macd,
    );

    const vol = this.volatility.calculate(
      feature.atr,

      feature.price,
    );

    const isRange = this.range.detect(feature.adx);

    const isExpansion = this.expansion.detect(
      feature.atr,

      vol,
    );

    const isCompression = this.compression.detect(
      feature.atr,

      vol,
    );

    const state = this.classifier.classify(
      trend,

      isRange,

      isExpansion,

      isCompression,
    );

    const score = this.score.calculate(
      trend,

      vol,

      feature.liquidity,
    );

    return {
      symbol: feature.symbol,

      exchange: feature.exchange,

      timestamp: feature.timestamp,

      state,

      score,

      trend,

      volatility: vol,

      confidence: score,
    };
  }
}
