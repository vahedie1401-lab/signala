import { PipelineStage } from "./Pipeline";

export interface EventMetadata {
  traceId: string;

  correlationId: string;

  stage: PipelineStage;

  version: number;

  createdAt: number;

  processedAt?: number;

  latency: number;

  hostname: string;

  pid: number;

  retry: number;
}

export interface EventEnvelope<T> {
  metadata: EventMetadata;

  payload: T;
}
