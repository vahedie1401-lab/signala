export interface PipelineResult<T> {
  success: boolean;

  output?: T;

  error?: Error;
}
