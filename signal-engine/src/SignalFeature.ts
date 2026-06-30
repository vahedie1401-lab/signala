import { SignalDirection } from "./SignalDirection";

import { SignalType } from "./SignalType";

export interface SignalFeature {
  symbol: string;

  exchange: string;

  timestamp: number;

  direction: SignalDirection;

  type: SignalType;

  score: number;

  confidence: number;

  stopLoss: number;

  takeProfit: number;

  reasons: string[];
}
