import type { LiquidityFeature } from "@signala/liquidity-engine";
import { LiquidityAnalyzer } from "@signala/liquidity-engine";

export interface OrderBookSnapshot {
  symbol: string;

  timestamp: number;

  totalBidLiquidity: number;

  totalAskLiquidity: number;

  imbalance: number;
}

/**
 * Wires the REAL liquidity-engine analyzer (LiquidityAnalyzer — pressure,
 * sweep, void, and grab detectors) into the backtest.
 *
 * IMPORTANT — data-availability limitation:
 * liquidity-engine's analysis is fundamentally about order-book depth
 * (bid/ask liquidity), which a plain trade-print history does not contain.
 * There are two supported modes:
 *
 *   1. Real order book snapshots: pass `orderBookSnapshots` to
 *      BacktestEngine and this class feeds them straight into the same
 *      LiquidityAnalyzer used in production — fully accurate.
 *
 *   2. No order book data available: falls back to a volume-imbalance
 *      proxy (rolling buy vs. sell trade volume standing in for bid/ask
 *      depth) fed into the SAME real LiquidityAnalyzer. The analyzer logic
 *      is 100% production code; only the upstream input is approximated.
 *      This is clearly weaker than real order-book depth and should not be
 *      treated as ground truth — treat sweep/void/grab flags from proxy
 *      mode as directional hints, not precise detections.
 */
export class BacktestLiquidityTracker {
  private readonly analyzer = new LiquidityAnalyzer();

  private readonly snapshotsBySymbol = new Map<string, OrderBookSnapshot[]>();

  private cursor = 0;

  private rollingBuy = 0;

  private rollingSell = 0;

  constructor(
    orderBookSnapshots: OrderBookSnapshot[] = [],

    private readonly rollingWindowMs = 5_000,
  ) {
    for (const snapshot of orderBookSnapshots) {
      const list = this.snapshotsBySymbol.get(snapshot.symbol) ?? [];
      list.push(snapshot);
      this.snapshotsBySymbol.set(snapshot.symbol, list);
    }

    for (const list of this.snapshotsBySymbol.values()) {
      list.sort((a, b) => a.timestamp - b.timestamp);
    }
  }

  update(
    symbol: string,
    exchange: string,
    timestamp: number,
    price: number,
    volume: number,
    side: "buy" | "sell",
  ): LiquidityFeature {
    const real = this.findSnapshot(symbol, timestamp);

    if (real) {
      return this.analyzer.analyze(
        symbol,
        exchange,
        timestamp,
        real.totalBidLiquidity,
        real.totalAskLiquidity,
        real.imbalance,
      );
    }

    // Proxy path: no real order book data for this symbol/time — approximate
    // bid/ask pressure from rolling trade-side volume.
    if (side === "buy") this.rollingBuy += volume;
    else this.rollingSell += volume;

    // Decay so the window is effectively rolling rather than cumulative.
    this.rollingBuy *= 0.98;
    this.rollingSell *= 0.98;

    const total = this.rollingBuy + this.rollingSell;
    const imbalance = total === 0 ? 0 : (this.rollingBuy - this.rollingSell) / total;

    return this.analyzer.analyze(
      symbol,
      exchange,
      timestamp,
      this.rollingBuy,
      this.rollingSell,
      imbalance,
    );
  }

  private findSnapshot(symbol: string, timestamp: number): OrderBookSnapshot | undefined {
    const list = this.snapshotsBySymbol.get(symbol);

    if (!list || list.length === 0) return undefined;

    // Advance a monotonic cursor to the latest snapshot at or before `timestamp`.
    while (this.cursor + 1 < list.length && list[this.cursor + 1]!.timestamp <= timestamp) {
      this.cursor += 1;
    }

    const candidate = list[this.cursor];

    return candidate && candidate.timestamp <= timestamp ? candidate : undefined;
  }
}
