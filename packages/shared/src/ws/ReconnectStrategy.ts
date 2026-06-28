export class ReconnectStrategy {
  constructor(
    private readonly baseDelay = 1000,
    private readonly maxDelay = 30000,
  ) {}

  getDelay(attempt: number): number {
    return Math.min(this.baseDelay * Math.pow(2, attempt), this.maxDelay);
  }
}
