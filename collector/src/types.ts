// src/types.ts

export interface TradeEvent {
  symbol: string;
  price: number;
  volume: number;
  side: "buy" | "sell";
  timestamp: number;
}
