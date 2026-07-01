export type BacktestDirection = "LONG" | "SHORT";

export interface OpenPosition {
  symbol: string;

  direction: BacktestDirection;

  entryPrice: number;

  entryTime: number;

  stopLoss: number;

  takeProfit: number;

  size: number;

  score: number;
}

export type ExitReason = "TAKE_PROFIT" | "STOP_LOSS" | "END_OF_DATA";

export interface ClosedTrade {
  symbol: string;

  direction: BacktestDirection;

  entryPrice: number;

  entryTime: number;

  exitPrice: number;

  exitTime: number;

  size: number;

  score: number;

  exitReason: ExitReason;

  /** Realized profit/loss in quote currency, net of fees. */
  pnl: number;

  /** Realized profit/loss as a percentage of the position's notional value. */
  pnlPercent: number;

  fees: number;
}
