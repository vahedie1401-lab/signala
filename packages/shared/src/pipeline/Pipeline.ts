import type { PipelineContext } from "./PipelineContext";
import type { PipelineMiddleware } from "./PipelineMiddleware";

export interface Pipeline<I, O> {
  execute(input: I, context: PipelineContext): Promise<O>;
}

export abstract class BasePipeline<I, O> implements Pipeline<I, O> {
  private readonly middlewares: PipelineMiddleware[] = [];

  use(middleware: PipelineMiddleware): this {
    this.middlewares.push(middleware);
    return this;
  }

  protected abstract process(input: I, context: PipelineContext): Promise<O>;

  async execute(input: I, context: PipelineContext): Promise<O> {
    for (const middleware of this.middlewares) {
      await middleware.before(context, input);
    }

    const output = await this.process(input, context);

    for (const middleware of this.middlewares) {
      await middleware.after(context, output);
    }

    return output;
  }
}
