import { z } from "zod";

import { BaseEventSchema } from "../base/schema";

export const MarketStateSchema = BaseEventSchema.extend({
  trend: z.enum(["bull", "bear", "range"]),

  strength: z.number(),

  confidence: z.number(),
});

export type MarketState = z.infer<typeof MarketStateSchema>;
