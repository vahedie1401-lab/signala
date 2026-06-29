import type { PipelineContext } from "./PipelineContext";

export interface PipelineMiddleware {
  before(context: PipelineContext, input: unknown): Promise<void>;

  after(context: PipelineContext, output: unknown): Promise<void>;
}
