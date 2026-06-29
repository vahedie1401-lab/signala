import { z } from "zod";

import { BaseEventSchema } from "../base/schema";

export const IndicatorEventSchema = BaseEventSchema.extend({
  price: z.number(),

  volume: z.number(),

  ema20: z.number(),

  ema50: z.number(),

  rsi: z.number(),

  atr: z.number(),

  macd: z.number(),

  macdSignal: z.number(),

  macdHistogram: z.number(),

  vwap: z.number(),

  adx: z.number(),

  superTrend: z.enum(["BUY", "SELL"]),
});

export type IndicatorEvent = z.infer<typeof IndicatorEventSchema>;
