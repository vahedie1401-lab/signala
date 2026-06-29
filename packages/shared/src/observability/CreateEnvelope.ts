import { TraceContext } from "./TraceContext";

import { PipelineStage } from "./Pipeline";

import type { EventEnvelope } from "./EventEnvelope";

export function createEnvelope<T>(payload: T, stage: PipelineStage): EventEnvelope<T> {
  return {
    metadata: TraceContext.create(stage),

    payload,
  };
}
