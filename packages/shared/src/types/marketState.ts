export type MarketTrend = "UP" | "DOWN" | "SIDEWAYS";

export interface MarketState {
  symbol: string;

  trend: MarketTrend;

  volatility: number;

  liquidity: number;

  momentum: number;

  confidence: number;

  timestamp: number;
}
