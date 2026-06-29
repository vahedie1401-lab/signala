import { z } from "zod";

import { BaseEventSchema } from "../base/schema";

export const WhaleEventSchema = BaseEventSchema.extend({
  usdSize: z.number(),

  score: z.number(),

  direction: z.enum(["long", "short"]),

  wallet: z.string(),
});

export type WhaleEvent = z.infer<typeof WhaleEventSchema>;
