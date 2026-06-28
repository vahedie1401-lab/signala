class Counter {
  private value = 0;

  inc(count = 1) {
    this.value += count;
  }

  get() {
    return this.value;
  }
}

class Histogram {
  private readonly values: number[] = [];

  observe(value: number) {
    this.values.push(value);
  }

  avg() {
    if (!this.values.length) {
      return 0;
    }

    return this.values.reduce((a, b) => a + b, 0) / this.values.length;
  }
}

export class Metrics {
  private readonly counters = new Map<string, Counter>();

  private readonly histograms = new Map<string, Histogram>();

  counter(name: string) {
    if (!this.counters.has(name)) {
      this.counters.set(
        name,

        new Counter(),
      );
    }

    return this.counters.get(name)!;
  }

  histogram(name: string) {
    if (!this.histograms.has(name)) {
      this.histograms.set(
        name,

        new Histogram(),
      );
    }

    return this.histograms.get(name)!;
  }
}

export const metrics = new Metrics();
