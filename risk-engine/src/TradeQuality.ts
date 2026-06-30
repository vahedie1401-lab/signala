export class TradeQuality {
  calculate(
    confidence: number,

    rr: number,

    trend: number,
  ) {
    return Math.min(
      100,

      confidence * 0.5 + rr * 15 + trend * 0.2,
    );
  }
}
