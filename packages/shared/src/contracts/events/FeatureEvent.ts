import { z } from "zod";

import { BaseEventSchema } from "../base/schema";

export const FeatureEventSchema = BaseEventSchema.extend({
  spread: z.number(),

  imbalance: z.number(),

  deltaVolume: z.number(),

  vwap: z.number(),

  volatility: z.number(),
});

export type FeatureEvent = z.infer<typeof FeatureEventSchema>;
