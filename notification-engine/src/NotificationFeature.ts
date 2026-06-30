export interface Notification {
  symbol: string;

  direction: string;

  score: number;

  confidence: number;

  entry: number;

  stopLoss: number;

  takeProfit: number;
}
