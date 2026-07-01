import { FeatureCalculator } from "@signala/feature-engine";
import { ATRStopLoss, DynamicTakeProfit, PositionSize } from "@signala/risk-engine";

import type { BacktestConfig } from "./BacktestConfig";
import { DEFAULT_BACKTEST_CONFIG } from "./BacktestConfig";
import type { ClosedTrade, OpenPosition } from "./BacktestPosition";
import type { BacktestReport } from "./BacktestReport";
import { BacktestScorer } from "./BacktestScorer";
import type { HistoricalTrade } from "./HistoricalTrade";
import { PerformanceCalculator } from "./PerformanceCalculator";

/**
 * BacktestEngine
 *
 * Replays a chronologically-ordered array of historical trades through the
 * same feature-calculation and risk-sizing logic used in production
 * (@signala/feature-engine's FeatureCalculator and @signala/risk-engine's
 * ATR-based stop-loss / take-profit / position-size helpers), and produces
 * a full performance report.
 *
 * This is an offline analysis tool (not a BaseEngine) — it does not read
 * from or write to Redis streams. Feed it historical trades from a CSV
 * dump, a Postgres query, or any other source via HistoricalDataLoader.
 */
export class BacktestEngine {
  private readonly config: BacktestConfig;

  private readonly calculator = new FeatureCalculator();

  private readonly scorer = new BacktestScorer();

  private readonly stopLoss = new ATRStopLoss();

  private readonly takeProfit = new DynamicTakeProfit();

  private readonly positionSize = new PositionSize();

  private readonly performance = new PerformanceCalculator();

  constructor(config: Pick<BacktestConfig, "symbol"> & Partial<BacktestConfig>) {
    this.config = { ...DEFAULT_BACKTEST_CONFIG, ...config };
  }

  run(trades: HistoricalTrade[]): BacktestReport {
    const startedAt = Date.now();

    const relevant = trades
      .filter((trade) => trade.symbol === this.config.symbol)
      .sort((a, b) => a.timestamp - b.timestamp);

    let balance = this.config.initialBalance;
    const openPositions: OpenPosition[] = [];

    const closedTrades: ClosedTrade[] = [];

    for (const trade of relevant) {
      const feature = this.calculator.update({
        id: `${trade.symbol}-${trade.timestamp}`,
        symbol: trade.symbol,
        exchange: trade.exchange,
        timestamp: trade.timestamp,
        source: "backtest",
        tradeId: `${trade.timestamp}`,
        price: trade.price,
        quantity: trade.volume,
        volume: trade.volume,
        side: trade.side,
      });

      for (let i = openPositions.length - 1; i >= 0; i -= 1) {
        const position = openPositions[i]!;

        const hitTakeProfit =
          position.direction === "LONG"
            ? trade.price >= position.takeProfit
            : trade.price <= position.takeProfit;

        const hitStopLoss =
          position.direction === "LONG"
            ? trade.price <= position.stopLoss
            : trade.price >= position.stopLoss;

        if (hitTakeProfit || hitStopLoss) {
          const exitPrice = hitTakeProfit ? position.takeProfit : position.stopLoss;

          const closed = this.close(
            position,
            exitPrice,
            trade.timestamp,
            hitTakeProfit ? "TAKE_PROFIT" : "STOP_LOSS",
          );

          balance += closed.pnl;
          closedTrades.push(closed);
          openPositions.splice(i, 1);
        }
      }

      const canOpen = this.config.singlePosition ? openPositions.length === 0 : true;

      if (canOpen) {
        const { score, direction } = this.scorer.score(feature);

        if (score >= this.config.minScore) {
          openPositions.push(
            this.open(feature.price, trade.timestamp, direction, score, feature.atr, balance),
          );
        }
      }
    }

    // Force-close any still-open positions at the last known price so the
    // report reflects a fully realized P&L.
    if (openPositions.length > 0 && relevant.length > 0) {
      const last = relevant[relevant.length - 1]!;

      for (const position of openPositions) {
        const closed = this.close(position, last.price, last.timestamp, "END_OF_DATA");

        balance += closed.pnl;
        closedTrades.push(closed);
      }
    }

    return {
      config: this.config,
      tradesConsidered: relevant.length,
      trades: closedTrades,
      performance: this.performance.calculate(this.config.initialBalance, closedTrades),
      startedAt,
      finishedAt: Date.now(),
    };
  }

  private open(
    price: number,
    time: number,
    direction: "LONG" | "SHORT",
    score: number,
    atr: number,
    balance: number,
  ): OpenPosition {
    const stopLoss =
      direction === "LONG" ? this.stopLoss.long(price, atr) : this.stopLoss.short(price, atr);

    const targets =
      direction === "LONG" ? this.takeProfit.long(price, atr) : this.takeProfit.short(price, atr);

    const stopDistance = Math.abs(price - stopLoss);

    const size = this.positionSize.calculate(balance, this.config.riskPerTrade, stopDistance);

    return {
      symbol: this.config.symbol,
      direction,
      entryPrice: price,
      entryTime: time,
      stopLoss,
      takeProfit: targets.tp1,
      size,
      score,
    };
  }

  private close(
    position: OpenPosition,
    exitPrice: number,
    exitTime: number,
    reason: ClosedTrade["exitReason"],
  ): ClosedTrade {
    const grossPnl =
      position.direction === "LONG"
        ? (exitPrice - position.entryPrice) * position.size
        : (position.entryPrice - exitPrice) * position.size;

    const entryNotional = position.entryPrice * position.size;
    const exitNotional = exitPrice * position.size;
    const fees = (entryNotional + exitNotional) * this.config.feeRate;

    const pnl = grossPnl - fees;

    return {
      symbol: position.symbol,
      direction: position.direction,
      entryPrice: position.entryPrice,
      entryTime: position.entryTime,
      exitPrice,
      exitTime,
      size: position.size,
      score: position.score,
      exitReason: reason,
      pnl,
      pnlPercent: entryNotional === 0 ? 0 : (pnl / entryNotional) * 100,
      fees,
    };
  }
}
