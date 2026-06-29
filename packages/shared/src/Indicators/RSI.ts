import { Indicator } from "./Indicator";

export class RSI implements Indicator<number> {
  private gains: number[] = [];
  private losses: number[] = [];

  private previousPrice?: number;

  constructor(private readonly period = 14) {}

  update(price: number): void {
    if (this.previousPrice === undefined) {
      this.previousPrice = price;
      return;
    }

    const diff = price - this.previousPrice;

    this.previousPrice = price;

    this.gains.push(Math.max(diff, 0));
    this.losses.push(Math.max(-diff, 0));

    if (this.gains.length > this.period) {
      this.gains.shift();
      this.losses.shift();
    }
  }

  value(): number {
    if (this.gains.length < this.period) return 50;

    const avgGain = this.gains.reduce((a, b) => a + b, 0) / this.period;

    const avgLoss = this.losses.reduce((a, b) => a + b, 0) / this.period;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;

    return 100 - 100 / (1 + rs);
  }
}
