export class PositionSize {
  calculate(
    balance: number,

    risk: number,

    stopDistance: number,
  ) {
    if (stopDistance <= 0) {
      return 0;
    }

    return (balance * risk) / stopDistance;
  }
}
