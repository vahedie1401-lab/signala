import { ContextStore } from "./store/ContextStore";
import { SignalContext } from "./SignalContext";

export class ContextBuilder {
  public readonly store: ContextStore;

  constructor() {
    this.store = new ContextStore();
  }

  get(symbol: string): SignalContext {
    return this.store.get(symbol);
  }

  updateIndicator(symbol: string, indicator: unknown): SignalContext {
    return this.store.update(symbol, (ctx) => {
      ctx.indicator = indicator;
    });
  }

  updateWhale(symbol: string, whale: unknown): SignalContext {
    return this.store.update(symbol, (ctx) => {
      ctx.whale = whale;
    });
  }

  updateLiquidity(symbol: string, liquidity: unknown): SignalContext {
    return this.store.update(symbol, (ctx) => {
      ctx.liquidity = liquidity;
    });
  }

  updateMarket(symbol: string, market: unknown): SignalContext {
    return this.store.update(symbol, (ctx) => {
      ctx.market = market;
    });
  }
}
