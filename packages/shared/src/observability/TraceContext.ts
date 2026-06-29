import os from "node:os";

import { PipelineStage } from "./Pipeline";

import { Correlation } from "./Correlation";

export class TraceContext {
  static create(stage: PipelineStage) {
    const ids = Correlation.root();

    return {
      traceId: ids.traceId,

      correlationId: ids.correlationId,

      stage,

      version: 1,

      createdAt: Date.now(),

      latency: 0,

      hostname: os.hostname(),

      pid: process.pid,

      retry: 0,
    };
  }
}
