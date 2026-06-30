export class LiquidityVoidDetector {
  detect(
    bid: number,

    ask: number,
  ): boolean {
    return bid < 100 || ask < 100;
  }
}
