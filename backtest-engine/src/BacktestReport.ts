import type { BacktestConfig } from "./BacktestConfig";
import type { ClosedTrade } from "./BacktestPosition";
import type { PerformanceReport } from "./PerformanceCalculator";

export interface BacktestReport {
  config: BacktestConfig;

  tradesConsidered: number;

  trades: ClosedTrade[];

  performance: PerformanceReport;

  startedAt: number;

  finishedAt: number;
}
