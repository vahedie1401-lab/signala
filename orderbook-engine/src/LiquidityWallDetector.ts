import { OrderBook } from "./OrderBook";

export class LiquidityWallDetector {
  detect(
    book: OrderBook,

    threshold = 500,
  ) {
    const walls = [];

    for (const level of book.bids.values()) {
      if (level.quantity > threshold) {
        walls.push(level);
      }
    }

    for (const level of book.asks.values()) {
      if (level.quantity > threshold) {
        walls.push(level);
      }
    }

    return walls;
  }
}
