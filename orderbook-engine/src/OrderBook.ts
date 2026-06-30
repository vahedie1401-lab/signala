import { OrderBookLevel } from "./OrderBookLevel";
import { BookLevel, DepthUpdate } from "./types";
import { OrderBookSnapshot } from "./OrderBookSnapshot";

export class OrderBook {
  readonly bids = new Map<number, OrderBookLevel>();

  readonly asks = new Map<number, OrderBookLevel>();

  private updateId = 0;

  applySnapshot(snapshot: OrderBookSnapshot) {
    this.bids.clear();

    this.asks.clear();

    this.updateId = snapshot.lastUpdateId;

    for (const bid of snapshot.bids) {
      this.bids.set(
        bid.price,

        new OrderBookLevel(
          bid.price,

          bid.quantity,
        ),
      );
    }

    for (const ask of snapshot.asks) {
      this.asks.set(
        ask.price,

        new OrderBookLevel(
          ask.price,

          ask.quantity,
        ),
      );
    }
  }

  applyDelta(delta: DepthUpdate) {
    this.updateId = delta.finalUpdateId;

    for (const bid of delta.bids) {
      if (bid.quantity === 0) {
        this.bids.delete(bid.price);
      } else {
        const level = this.bids.get(bid.price);

        if (level) {
          level.update(bid.quantity);
        } else {
          this.bids.set(
            bid.price,

            new OrderBookLevel(
              bid.price,

              bid.quantity,
            ),
          );
        }
      }
    }

    for (const ask of delta.asks) {
      if (ask.quantity === 0) {
        this.asks.delete(ask.price);
      } else {
        this.asks.set(
          ask.price,

          new OrderBookLevel(
            ask.price,

            ask.quantity,
          ),
        );
      }
    }
  }

  bestBid() {
    let best = 0;

    for (const price of this.bids.keys()) {
      if (price > best) {
        best = price;
      }
    }

    return best;
  }

  bestAsk() {
    let best = Number.MAX_VALUE;

    for (const price of this.asks.keys()) {
      if (price < best) {
        best = price;
      }
    }

    return best === Number.MAX_VALUE ? 0 : best;
  }

  spread() {
    return this.bestAsk() - this.bestBid();
  }
}
