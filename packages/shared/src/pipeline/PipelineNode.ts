export abstract class PipelineNode<I, O> {
  abstract execute(input: I): Promise<O>;
}
