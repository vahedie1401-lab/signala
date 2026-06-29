export class IcebergDetector {
  detect(trades: number[], threshold = 8): boolean {
    if (trades.length < threshold) return false;

    const avg = trades.reduce((a, b) => a + b, 0) / trades.length;

    let repeated = 0;

    for (const size of trades) {
      if (Math.abs(size - avg) < avg * 0.03) {
        repeated++;
      }
    }

    return repeated >= threshold;
  }
}
