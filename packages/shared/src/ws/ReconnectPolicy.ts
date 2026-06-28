export interface ReconnectOptions {
  initialDelay?: number;

  maxDelay?: number;

  multiplier?: number;

  jitter?: boolean;
}

export class ReconnectPolicy {
  private attempts = 0;

  constructor(private readonly options: ReconnectOptions = {}) {}

  reset(): void {
    this.attempts = 0;
  }

  nextDelay(): number {
    const initial = this.options.initialDelay ?? 1000;

    const max = this.options.maxDelay ?? 30000;

    const multiplier = this.options.multiplier ?? 2;

    let delay = initial * Math.pow(multiplier, this.attempts);

    if (delay > max) {
      delay = max;
    }

    if (this.options.jitter !== false) {
      delay += Math.random() * 1000;
    }

    this.attempts++;

    return Math.round(delay);
  }
}
