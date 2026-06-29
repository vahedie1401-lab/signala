import { z } from "zod";

export const BaseEventSchema = z.object({
  id: z.string(),

  symbol: z.string(),

  exchange: z.string(),

  timestamp: z.number(),

  source: z.string(),
});

export type BaseEvent = z.infer<typeof BaseEventSchema>;
