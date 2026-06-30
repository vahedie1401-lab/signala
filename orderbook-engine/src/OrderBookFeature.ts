export interface OrderBookFeature {
  symbol: string;

  spread: number;

  imbalance: number;

  totalBidLiquidity: number;

  totalAskLiquidity: number;

  bestBid: number;

  bestAsk: number;

  walls: number;
}
