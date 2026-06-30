export class RiskReward {
  calculate(
    entry: number,

    stop: number,

    target: number,
  ): number {
    const risk = Math.abs(entry - stop);

    const reward = Math.abs(target - entry);

    if (risk === 0) {
      return 0;
    }

    return reward / risk;
  }
}
