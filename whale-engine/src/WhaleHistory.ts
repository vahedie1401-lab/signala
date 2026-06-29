import { WhaleSignal } from "./WhaleSignal";

export class WhaleHistory {
  private readonly history = new Map<string, WhaleSignal[]>();

  push(signal: WhaleSignal): void {
    const list = this.history.get(signal.symbol) ?? [];

    list.push(signal);

    if (list.length > 500) {
      list.shift();
    }

    this.history.set(signal.symbol, list);
  }

  get(symbol: string): WhaleSignal[] {
    return this.history.get(symbol) ?? [];
  }
}
