import { EMA } from "./EMA";

export class MACD {
  readonly fast = new EMA(12);

  readonly slow = new EMA(26);

  readonly signal = new EMA(9);

  update(price: number): void {
    this.fast.update(price);

    this.slow.update(price);

    this.signal.update(this.macd());
  }

  macd(): number {
    return this.fast.value() - this.slow.value();
  }

  histogram(): number {
    return this.macd() - this.signal.value();
  }

  value() {
    return {
      macd: this.macd(),

      signal: this.signal.value(),

      histogram: this.histogram(),
    };
  }
}
