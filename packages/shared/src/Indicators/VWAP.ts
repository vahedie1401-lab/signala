export class VWAP {
  private volume = 0;

  private total = 0;

  update(price: number, qty: number) {
    this.volume += qty;

    this.total += price * qty;
  }

  value() {
    if (this.volume === 0) return 0;

    return this.total / this.volume;
  }
}
