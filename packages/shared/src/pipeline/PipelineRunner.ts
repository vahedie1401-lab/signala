import { PipelineNode } from "./PipelineNode";
import { PipelineResult } from "./PipelineResult";

export class PipelineRunner<I, O> {
  constructor(private readonly node: PipelineNode<I, O>) {}

  async run(input: I): Promise<PipelineResult<O>> {
    try {
      return {
        success: true,

        output: await this.node.execute(input),
      };
    } catch (error) {
      return {
        success: false,

        error: error as Error,
      };
    }
  }
}
