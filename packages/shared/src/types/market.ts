import { BaseEvent } from "./common";

export interface MarketEvent extends BaseEvent {
  trend: number;

  volatility: number;

  liquidity: number;

  confidence: number;
}
