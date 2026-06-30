/**
 * Bounded FIFO window of timestamped numeric samples for one series.
 * Used to derive trend direction / volatility / % change without a
 * dedicated historical store. Memory-bounded by `maxSize`.
 */
export class RollingWindow {
  private readonly samples: { value: number; timestamp: number }[] = [];

  constructor(private readonly maxSize: number) {}

  push(value: number, timestamp: number = Date.now()): void {
    this.samples.push({ value, timestamp });

    if (this.samples.length > this.maxSize) {
      this.samples.shift();
    }
  }

  values(): number[] {
    return this.samples.map((s) => s.value);
  }

  latest(): number | undefined {
    return this.samples.at(-1)?.value;
  }

  first(): number | undefined {
    return this.samples[0]?.value;
  }

  size(): number {
    return this.samples.length;
  }

  isEmpty(): boolean {
    return this.samples.length === 0;
  }

  mean(): number {
    if (this.samples.length === 0) return 0;

    return this.samples.reduce((acc, s) => acc + s.value, 0) / this.samples.length;
  }

  stdDev(): number {
    if (this.samples.length < 2) return 0;

    const avg = this.mean();

    const variance =
      this.samples.reduce((acc, s) => acc + (s.value - avg) ** 2, 0) / this.samples.length;

    return Math.sqrt(variance);
  }

  /**
   * Percentage change from first sample in window to latest.
   * Returns 0 if insufficient data or first value is 0.
   */
  percentChange(): number {
    const first = this.first();

    const last = this.latest();

    if (first === undefined || last === undefined || first === 0) return 0;

    return ((last - first) / Math.abs(first)) * 100;
  }

  /**
   * Simple trend classification based on percent change vs threshold.
   */
  trend(thresholdPercent = 2): "rising" | "falling" | "stable" {
    const change = this.percentChange();

    if (change > thresholdPercent) return "rising";

    if (change < -thresholdPercent) return "falling";

    return "stable";
  }

  /** Drop samples older than maxAgeMs relative to now. */
  pruneOlderThan(maxAgeMs: number, now: number = Date.now()): void {
    while (this.samples.length > 0 && now - this.samples[0]!.timestamp > maxAgeMs) {
      this.samples.shift();
    }
  }
}

/**
 * Keyed registry of RollingWindow instances, one per symbol.
 * Avoids manual Map<string, RollingWindow> boilerplate scattered across sources.
 */
export class SymbolWindowRegistry {
  private readonly windows = new Map<string, RollingWindow>();

  constructor(private readonly maxSize: number) {}

  get(symbol: string): RollingWindow {
    let window = this.windows.get(symbol);

    if (!window) {
      window = new RollingWindow(this.maxSize);

      this.windows.set(symbol, window);
    }

    return window;
  }

  has(symbol: string): boolean {
    return this.windows.has(symbol);
  }

  symbols(): string[] {
    return [...this.windows.keys()];
  }
}
