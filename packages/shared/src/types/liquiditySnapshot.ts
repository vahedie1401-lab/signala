export interface LiquiditySnapshot {
  symbol: string;

  bestBid: number;

  bestAsk: number;

  spread: number;

  bidLiquidity: number;

  askLiquidity: number;

  imbalance: number;

  timestamp: number;
}
