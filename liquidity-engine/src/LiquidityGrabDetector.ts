export class LiquidityGrabDetector {
  detect(
    imbalance: number,

    pressure: number,
  ): boolean {
    return Math.abs(imbalance) > 0.75 && Math.abs(pressure) > 0.6;
  }
}
