import { SignalContext } from "./SignalContext";

export class ConfidenceBooster {
  boost(
    confidence: number,

    ctx: SignalContext,
  ): number {
    let value = confidence;

    if (ctx.whale?.confidence > 80) {
      value += 5;
    }

    if (ctx.market?.state === "TREND") {
      value += 5;
    }

    if (ctx.liquidity?.grab) {
      value += 5;
    }

    return Math.min(
      value,

      100,
    );
  }
}
