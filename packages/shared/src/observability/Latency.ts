export class Latency {
  readonly start = performance.now();

  end() {
    return performance.now() - this.start;
  }
}
