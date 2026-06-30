import { SignalContext } from "./SignalContext";

export class ContextValidator {
  valid(ctx: SignalContext): boolean {
    return (
      ctx.indicator !== undefined &&
      ctx.whale !== undefined &&
      ctx.liquidity !== undefined &&
      ctx.market !== undefined
    );
  }
}
