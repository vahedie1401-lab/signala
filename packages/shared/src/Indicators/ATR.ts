export class ATR {
  private values: number[] = [];

  constructor(private readonly period: number) {}

  update(tr: number) {
    this.values.push(tr);

    if (this.values.length > this.period) {
      this.values.shift();
    }
  }

  value() {
    if (this.values.length === 0) return 0;

    return this.values.reduce((a, b) => a + b, 0) / this.values.length;
  }
}
