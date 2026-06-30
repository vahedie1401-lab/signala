import { MarketState } from "./MarketFeature";

export class MarketStateClassifier {
  classify(
    trend: number,

    range: boolean,

    expansion: boolean,

    compression: boolean,
  ): MarketState {
    if (expansion) {
      return MarketState.EXPANSION;
    }

    if (compression) {
      return MarketState.COMPRESSION;
    }

    if (range) {
      return MarketState.RANGE;
    }

    return MarketState.TREND;
  }
}
