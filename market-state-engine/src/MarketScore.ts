export class MarketScore {
  calculate(
    trend: number,

    volatility: number,

    liquidity: number,
  ): number {
    let score = 0;

    score += trend * 0.5;

    score += volatility * 30;

    score += liquidity * 20;

    return Math.min(
      score,

      100,
    );
  }
}
