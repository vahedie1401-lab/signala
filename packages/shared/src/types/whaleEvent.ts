export interface WhaleEvent {
  symbol: string;

  side: "buy" | "sell";

  price: number;

  volume: number;

  usdValue: number;

  score: number;

  timestamp: number;
}
