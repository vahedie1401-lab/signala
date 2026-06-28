export type TradeSide = "buy" | "sell";

export interface Trade {
  symbol: string;

  price: number;

  volume: number;

  side: TradeSide;

  timestamp: number;
}
