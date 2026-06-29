export interface WhaleSignal {
  symbol: string;

  exchange: string;

  timestamp: number;

  side: "BUY" | "SELL";

  score: number;

  usdSize: number;

  volumeRatio: number;

  confidence: number;
}
