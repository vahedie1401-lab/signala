import { HistoryItem } from "./SignalHistory";

export class PerformanceTracker {
  private readonly history: HistoryItem[] = [];

  add(item: HistoryItem) {
    this.history.push(item);
  }

  successRate() {
    if (this.history.length === 0) {
      return 0;
    }

    const ok = this.history.filter((x) => x.success).length;

    return ok / this.history.length;
  }
}
