import { SignalContext } from "../SignalContext";

import { AdaptiveWeights } from "./AdaptiveWeights";

export class AIWeightEngine {
  constructor(private readonly weights = new AdaptiveWeights()) {}

  score(ctx: SignalContext) {
    const w = this.weights.get();

    let score = 0;

    score += ctx.indicator.score * w.indicator;

    score += ctx.whale.score * w.whale;

    score += ctx.liquidity.confidence * w.liquidity;

    score += ctx.market.score * w.market;

    if (ctx.correlation) score += ctx.correlation.score * w.correlation;

    if (ctx.funding) score += ctx.funding.score * w.funding;

    if (ctx.openInterest) score += ctx.openInterest.score * w.openInterest;

    return score;
  }
}
