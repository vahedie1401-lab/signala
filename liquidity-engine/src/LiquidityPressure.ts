export class LiquidityPressure {
  calculate(bid: number, ask: number): number {
    const total = bid + ask;

    if (total === 0) {
      return 0;
    }

    return (bid - ask) / total;
  }
}
