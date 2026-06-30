import { TimeframeContext } from "./TimeframeContext";
import { Timeframe } from "./Timeframe";

export class TimeframeStore {
  private readonly data = new Map<string, Map<Timeframe, TimeframeContext>>();

  update(
    symbol: string,

    context: TimeframeContext,
  ): void {
    let map = this.data.get(symbol);

    if (!map) {
      map = new Map();

      this.data.set(symbol, map);
    }

    map.set(
      context.timeframe,

      context,
    );
  }

  get(symbol: string): Map<Timeframe, TimeframeContext> | undefined {
    return this.data.get(symbol);
  }
}
