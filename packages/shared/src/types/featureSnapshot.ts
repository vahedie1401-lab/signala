export interface FeatureSnapshot {
  symbol: string;

  volume1m: number;

  buyVolume1m: number;

  sellVolume1m: number;

  notionalVolume1m: number;

  buyRatio: number;

  tradeCount1m: number;

  buyTradeCount: number;

  sellTradeCount: number;

  whaleTrades: number;

  avgTradeSize: number;

  tradesPerSecond: number;

  firstPrice: number;

  lastPrice: number;

  priceChange5s: number;

  priceChange15s: number;

  priceChange60s: number;

  priceChange1m: number;

  velocity: number;

  timestamp: number;
}
