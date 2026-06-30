export interface RiskFeature {
  symbol: string;

  exchange: string;

  timestamp: number;

  stopLoss: number;

  takeProfit1: number;

  takeProfit2: number;

  takeProfit3: number;

  leverage: number;

  positionSize: number;

  riskReward: number;

  quality: number;
}
