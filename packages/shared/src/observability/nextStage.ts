import { PipelineStage } from "./Pipeline";

import type { EventEnvelope } from "./EventEnvelope";

export function nextStage<T>(event: EventEnvelope<T>, stage: PipelineStage): EventEnvelope<T> {
  return {
    metadata: {
      ...event.metadata,

      stage,

      processedAt: Date.now(),

      latency: Date.now() - event.metadata.createdAt,
    },

    payload: event.payload,
  };
}
