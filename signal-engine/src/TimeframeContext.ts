import { Timeframe } from "./Timeframe";

export interface TimeframeContext {
  timeframe: Timeframe;

  trend: number;

  score: number;

  direction: "LONG" | "SHORT";

  timestamp: number;
}
