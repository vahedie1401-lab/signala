import { Timeframe } from "./Timeframe";
import { TimeframeStore } from "./TimeframeStore";

export class MultiTimeframeAnalyzer {
  constructor(private readonly store: TimeframeStore) {}

  confirmation(symbol: string): number {
    const map = this.store.get(symbol);

    if (!map) {
      return 0;
    }

    const m5 = map.get(Timeframe.M5);

    const m15 = map.get(Timeframe.M15);

    const h1 = map.get(Timeframe.H1);

    if (!m5 || !m15 || !h1) {
      return 0;
    }

    let score = 0;

    if (m5.direction === m15.direction) {
      score += 30;
    }

    if (m15.direction === h1.direction) {
      score += 30;
    }

    if (h1.direction === m5.direction) {
      score += 40;
    }

    return score;
  }
}
