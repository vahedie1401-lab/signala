import { SignalContext } from "./SignalContext";

export class SignalScorer {
  score(ctx: SignalContext): number {
    let score = 0;

    if (ctx.indicator.rsi > 55) score += 10;

    if (ctx.indicator.macd > 0) score += 15;

    if (ctx.indicator.ema20 > ctx.indicator.ema50) score += 10;

    if (ctx.whale.score > 70) score += 20;

    if (ctx.whale.confidence > 70) score += 10;

    if (ctx.liquidity.pressure > 0) score += 10;

    if (ctx.market.state === "TREND") score += 15;

    if (ctx.market.state === "EXPANSION") score += 10;

    score += ctx.multiTimeframe ?? 0;

    return Math.min(
      100,

      score,
    );
  }
}
