export class SuperTrend {
  private trend: "BUY" | "SELL" = "BUY";

  private upperBand = 0;

  private lowerBand = 0;

  constructor(private readonly multiplier = 3) {}

  update(close: number, atr: number, hl2: number): void {
    this.upperBand = hl2 + this.multiplier * atr;

    this.lowerBand = hl2 - this.multiplier * atr;

    if (close > this.upperBand) {
      this.trend = "BUY";
    } else if (close < this.lowerBand) {
      this.trend = "SELL";
    }
  }

  value() {
    return {
      trend: this.trend,

      upper: this.upperBand,

      lower: this.lowerBand,
    };
  }
}
