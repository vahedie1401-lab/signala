import { z } from "zod";

import { BaseEventSchema } from "../base/schema";

export const LiquidityEventSchema = BaseEventSchema.extend({
  bidLiquidity: z.number(),

  askLiquidity: z.number(),

  imbalance: z.number(),

  walls: z.array(z.number()),
});

export type LiquidityEvent = z.infer<typeof LiquidityEventSchema>;
