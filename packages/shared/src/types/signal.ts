export type SignalSide = "LONG" | "SHORT" | "NONE";

export interface Signal {
  symbol: string;

  side: SignalSide;

  score: number;

  confidence: number;

  entry: number;

  stopLoss: number;

  takeProfit: number[];

  reason: string[];

  timestamp: number;
}
