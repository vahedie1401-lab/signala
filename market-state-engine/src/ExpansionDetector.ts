export class ExpansionDetector {
  detect(
    atr: number,

    volatility: number,
  ): boolean {
    return volatility > atr * 1.3;
  }
}
