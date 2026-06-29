import { Indicator } from "./Indicator";

export class EMA implements Indicator<number> {
  private ema = 0;

  private initialized = false;

  constructor(private readonly period: number) {}

  update(price: number) {
    if (!this.initialized) {
      this.ema = price;

      this.initialized = true;

      return;
    }

    const k = 2 / (this.period + 1);

    this.ema = price * k + this.ema * (1 - k);
  }

  value() {
    return this.ema;
  }
}
