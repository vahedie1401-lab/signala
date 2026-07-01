export interface BacktestConfig {
  /** Symbol being backtested, e.g. "BTCUSDT". Trades for other symbols are ignored. */
  symbol: string;

  /** Starting account balance in quote currency. */
  initialBalance: number;

  /** Fraction of balance risked per trade, e.g. 0.01 = 1%. */
  riskPerTrade: number;

  /** Minimum SignalScorer-style confluence score (0-100) required to open a position. */
  minScore: number;

  /** Round-trip fee rate applied on entry and exit, e.g. 0.0004 = 4 bps taker fee. */
  feeRate: number;

  /** Only one position open at a time when true (simplest, most conservative mode). */
  singlePosition: boolean;
}

export const DEFAULT_BACKTEST_CONFIG: Omit<BacktestConfig, "symbol"> = {
  initialBalance: 10_000,
  riskPerTrade: 0.01,
  minScore: 60,
  feeRate: 0.0004,
  singlePosition: true,
};
