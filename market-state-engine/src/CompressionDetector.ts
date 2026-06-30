export class CompressionDetector {
  detect(
    atr: number,

    volatility: number,
  ): boolean {
    return volatility < atr * 0.7;
  }
}
