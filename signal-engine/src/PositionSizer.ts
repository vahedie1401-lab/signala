export class PositionSizer {
  calculate(
    account: number,

    riskPercent: number,

    stopDistance: number,
  ) {
    if (stopDistance <= 0) {
      return 0;
    }

    const risk = account * riskPercent;

    return risk / stopDistance;
  }
}
