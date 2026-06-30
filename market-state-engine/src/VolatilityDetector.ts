export class VolatilityDetector {
  calculate(
    atr: number,

    price: number,
  ): number {
    if (price === 0) {
      return 0;
    }

    return atr / price;
  }
}
