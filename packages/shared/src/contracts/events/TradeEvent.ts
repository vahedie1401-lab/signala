import { z } from "zod";

import { BaseEventSchema } from "../base/schema";

export const TradeEventSchema = BaseEventSchema.extend({
  tradeId: z.string(),

  price: z.number(),

  quantity: z.number(),

  volume: z.number(),

  side: z.enum(["buy", "sell"]),
});

export type TradeEvent = z.infer<typeof TradeEventSchema>;
