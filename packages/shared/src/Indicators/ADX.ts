//توجه: این نسخه ADX هنوز نیاز دارد که مقدار ADX از محاسبات +DI و -DI به آن داده شود. محاسبه کامل ADX (از OHLC) را در Batch مربوط به Candle Engine انجام می‌دهیم، چون به داده‌های High/Low/Close نیاز دارد.

export class ADX {
  private readonly values: number[] = [];

  constructor(private readonly period = 14) {}

  update(adxValue: number): void {
    this.values.push(adxValue);

    if (this.values.length > this.period) {
      this.values.shift();
    }
  }

  value(): number {
    if (this.values.length === 0) return 0;

    return this.values.reduce((a, b) => a + b, 0) / this.values.length;
  }
}
