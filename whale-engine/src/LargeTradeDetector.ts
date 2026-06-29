export class LargeTradeDetector {
  constructor(private readonly minUsd = 50000) {}

  detect(
    price: number,

    volume: number,
  ) {
    const usd = price * volume;

    return {
      detected: usd >= this.minUsd,

      usd,
    };
  }
}
