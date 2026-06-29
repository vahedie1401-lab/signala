import { z } from "zod";

import { BaseEventSchema } from "../base/schema";

export const SignalEventSchema = BaseEventSchema.extend({
  signal: z.enum(["BUY", "SELL", "EXIT", "HOLD"]),

  score: z.number(),

  confidence: z.number(),

  reasons: z.array(z.string()),
});

export type SignalEvent = z.infer<typeof SignalEventSchema>;
