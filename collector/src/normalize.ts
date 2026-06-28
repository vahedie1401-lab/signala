// src/normalize.ts

import { TradeEvent } from "./types";

export function normalizeTrade(data: any): TradeEvent {
  return {
    symbol: data.s,
    price: Number(data.p),
    volume: Number(data.q),
    side: data.m ? "sell" : "buy",
    timestamp: data.T,
  };
}
