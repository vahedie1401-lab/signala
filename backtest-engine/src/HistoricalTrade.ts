/**
 * A single historical trade print used to feed the backtest simulation.
 * This mirrors @signala/shared's TradeEvent but stays decoupled so the
 * backtest engine can be fed from CSV files, JSON dumps, or a database
 * without depending on the live event envelope format.
 */
export interface HistoricalTrade {
  symbol: string;

  exchange: string;

  timestamp: number;

  price: number;

  volume: number;

  side: "buy" | "sell";
}
