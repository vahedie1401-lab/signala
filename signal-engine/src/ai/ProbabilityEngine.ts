import { PerformanceTracker } from "./PerformanceTracker";

export class ProbabilityEngine {
  constructor(private readonly tracker = new PerformanceTracker()) {}

  probability(score: number) {
    const history = this.tracker.successRate();

    return score * 0.6 + history * 40;
  }
}
