import { OrderBookDelta } from "./OrderBookDelta";

export class DeltaBuffer {
  private readonly deltas: OrderBookDelta[] = [];

  push(delta: OrderBookDelta): void {
    this.deltas.push(delta);
  }

  clear(): void {
    this.deltas.length = 0;
  }

  values(): readonly OrderBookDelta[] {
    return this.deltas;
  }

  removeUntil(updateId: number): void {
    while (true) {
      const delta = this.deltas.at(0);

      if (!delta) {
        break;
      }

      if (delta.finalUpdateId > updateId) {
        break;
      }

      this.deltas.shift();
    }
  }
}
