export class RangeDetector {
  detect(adx: number): boolean {
    return adx < 20;
  }
}
