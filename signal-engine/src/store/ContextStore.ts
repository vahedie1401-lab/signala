import { SignalContext } from "../SignalContext";

export class ContextStore {
  private readonly contexts = new Map<string, SignalContext>();

  get(symbol: string): SignalContext {
    let context = this.contexts.get(symbol);

    if (!context) {
      context = {
        symbol,

        indicator: undefined,

        whale: undefined,

        liquidity: undefined,

        market: undefined,
      };

      this.contexts.set(symbol, context);
    }

    return context;
  }

  update(
    symbol: string,

    updater: (ctx: SignalContext) => void,
  ): SignalContext {
    const ctx = this.get(symbol);

    updater(ctx);

    return ctx;
  }
}
