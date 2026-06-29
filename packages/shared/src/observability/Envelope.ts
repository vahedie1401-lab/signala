import os from "node:os";

import { Trace } from "./Trace";

import { PipelineStage } from "./Pipeline";

export function createEnvelope<T>(payload: T, stage: PipelineStage) {
  const trace = Trace.create();

  return {
    metadata: {
      ...trace,

      stage,

      createdAt: Date.now(),

      latency: 0,

      version: "1.0",

      hostname: os.hostname(),

      pid: process.pid,
    },

    payload,
  };
}
