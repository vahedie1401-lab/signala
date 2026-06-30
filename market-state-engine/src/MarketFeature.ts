export enum MarketState {
  TREND = "TREND",

  RANGE = "RANGE",

  EXPANSION = "EXPANSION",

  COMPRESSION = "COMPRESSION",
}

export interface MarketFeature {
  symbol: string;

  exchange: string;

  timestamp: number;

  state: MarketState;

  score: number;

  trend: number;

  volatility: number;

  confidence: number;
}
