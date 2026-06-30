export class TrendDetector {
  detect(
    ema20: number,

    ema50: number,

    macd: number,
  ): number {
    let score = 0;

    if (ema20 > ema50) {
      score += 50;
    }

    if (macd > 0) {
      score += 50;
    }

    return score;
  }
}
