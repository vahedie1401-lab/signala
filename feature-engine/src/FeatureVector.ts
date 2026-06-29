export interface FeatureVector {
  symbol: string;

  exchange: string;

  timestamp: number;

  price: number;

  volume: number;

  momentum: number;

  acceleration: number;

  deltaVolume: number;

  volatility: number;

  ema20: number;

  ema50: number;

  rsi: number;

  macd: number;

  macdSignal: number;

  macdHistogram: number;

  atr: number;

  vwap: number;
}
