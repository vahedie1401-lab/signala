export class LeverageCalculator {
  calculate(volatility: number) {
    if (volatility < 0.01) {
      return 20;
    }

    if (volatility < 0.02) {
      return 10;
    }

    if (volatility < 0.04) {
      return 5;
    }

    return 2;
  }
}
