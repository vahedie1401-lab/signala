import { BaseEvent } from "./common";

export interface FeatureEvent extends BaseEvent {
  buyRatio: number;

  sellRatio: number;

  tradeCount: number;

  volume: number;

  notional: number;

  vwap: number;

  velocity: number;

  volatility: number;

  whales: number;
}
