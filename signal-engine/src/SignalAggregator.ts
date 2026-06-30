import { SignalDirection } from "./SignalDirection";

import { SignalFeature } from "./SignalFeature";

import { SignalType } from "./SignalType";

import { SignalContext } from "./SignalContext";

export class SignalAggregator {
  aggregate(
    ctx: SignalContext,

    score: number,
  ): SignalFeature {
    const direction =
      ctx.indicator.ema20 > ctx.indicator.ema50 ? SignalDirection.LONG : SignalDirection.SHORT;

    return {
      symbol: ctx.symbol,

      exchange: "binance",

      timestamp: Date.now(),

      direction,

      type: SignalType.SCALP,

      score,

      confidence: score,

      stopLoss: ctx.indicator.price - ctx.indicator.atr,

      takeProfit: ctx.indicator.price + ctx.indicator.atr * 2,

      reasons: [],
    };
  }
}
