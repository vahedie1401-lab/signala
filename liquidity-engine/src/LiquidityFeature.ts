export interface LiquidityFeature {
  symbol: string;

  exchange: string;

  timestamp: number;

  bidLiquidity: number;

  askLiquidity: number;

  imbalance: number;

  pressure: number;

  sweep: boolean;

  void: boolean;

  grab: boolean;

  confidence: number;
}
