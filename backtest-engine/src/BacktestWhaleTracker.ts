import type { FeatureVector } from "@signala/feature-engine";
import {
  LargeTradeDetector,
  SmartMoneyDetector,
  VolumeSpikeDetector,
  WhaleConfidence,
  WhaleScorer,
  WhaleSignal,
} from "@signala/whale-engine";

export interface BacktestWhaleSignal {
  symbol: string;
  score: number;
  confidence: number;
  usdSize: number;
  volumeRatio: number;
}

/**
 * Replays historical trades through the real whale-engine detection classes
 * (LargeTradeDetector, VolumeSpikeDetector, WhaleScorer, WhaleConfidence,
 * SmartMoneyDetector) instead of a hand-rolled approximation.
 *
 * Mirrors production behavior: a whale signal is only produced (and the
 * context updated) when a large trade is actually detected — otherwise the
 * previous signal stays "sticky", exactly like the live whale stream only
 * publishing on detection.
 */
export class BacktestWhaleTracker {
  private readonly large: LargeTradeDetector;

  private readonly spike = new VolumeSpikeDetector();

  private readonly scorer = new WhaleScorer();

  private readonly confidence = new WhaleConfidence();

  private readonly smartMoney = new SmartMoneyDetector();

  private last: BacktestWhaleSignal | undefined;

  constructor(minUsd = 50_000) {
    this.large = new LargeTradeDetector(minUsd);
  }

  update(
    symbol: string,
    price: number,
    volume: number,
    feature: FeatureVector,
  ): BacktestWhaleSignal | undefined {
    this.spike.update(volume);

    const detection = this.large.detect(price, volume);

    if (!detection.detected) {
      return this.last;
    }

    const volumeRatio = this.spike.score(volume);
    const smartScore = this.smartMoney.detect(feature);
    const rawScore = this.scorer.score(feature, detection.usd, volumeRatio);
    const score = (rawScore + smartScore) / 2;

    const signal: WhaleSignal = {
      symbol,
      exchange: "backtest",
      timestamp: Date.now(),
      side: detection.usd >= 0 ? "BUY" : "SELL",
      score,
      usdSize: detection.usd,
      volumeRatio,
      confidence: 0,
    };

    signal.confidence = this.confidence.calculate(signal);

    const result: BacktestWhaleSignal = {
      symbol,
      score,
      confidence: signal.confidence,
      usdSize: detection.usd,
      volumeRatio,
    };

    this.last = result;

    return result;
  }
}
