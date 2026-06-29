export class AbsorptionDetector {
  detect(buyVolume: number, sellVolume: number, priceChange: number): boolean {
    const total = buyVolume + sellVolume;

    if (total === 0) return false;

    const imbalance = Math.abs(buyVolume - sellVolume) / total;

    return imbalance > 0.75 && Math.abs(priceChange) < 0.001;
  }
}
