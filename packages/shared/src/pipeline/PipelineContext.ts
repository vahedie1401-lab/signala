export class PipelineContext {
  readonly started = performance.now();

  readonly values = new Map<string, unknown>();

  set<T>(key: string, value: T) {
    this.values.set(key, value);
  }

  get<T>(key: string): T {
    return this.values.get(key) as T;
  }
}
