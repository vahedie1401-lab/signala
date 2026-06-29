export class Bollinger {
  private readonly prices: number[] = [];

  constructor(
    private readonly period = 20,
    private readonly deviation = 2,
  ) {}

  update(price: number): void {
    this.prices.push(price);

    if (this.prices.length > this.period) {
      this.prices.shift();
    }
  }

  value() {
    if (this.prices.length === 0) {
      return {
        upper: 0,

        middle: 0,

        lower: 0,
      };
    }

    const mean = this.prices.reduce((a, b) => a + b, 0) / this.prices.length;

    const variance = this.prices.reduce((a, b) => a + (b - mean) ** 2, 0) / this.prices.length;

    const std = Math.sqrt(variance);

    return {
      upper: mean + std * this.deviation,

      middle: mean,

      lower: mean - std * this.deviation,
    };
  }
}
