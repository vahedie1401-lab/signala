import { FeatureVector } from "@signala/feature-engine";

export class WhaleScorer {
  score(
    feature: FeatureVector,

    usd: number,

    volumeRatio: number,
  ) {
    let score = 0;

    score +=
      Math.min(
        usd / 100000,

        1,
      ) * 35;

    score +=
      Math.min(
        volumeRatio,

        5,
      ) * 10;

    score += Math.abs(feature.deltaVolume) * 10;

    score += feature.rsi > 60 ? 10 : 0;

    score += feature.macd > 0 ? 10 : 0;

    score += feature.price > feature.vwap ? 10 : 0;

    score += feature.ema20 > feature.ema50 ? 10 : 0;

    score += Math.min(
      feature.volatility,

      10,
    );

    return Math.min(
      score,

      100,
    );
  }
}
