import { OrderBook } from "./OrderBook";

export class LiquidityCalculator {
  totalBid(book: OrderBook) {
    let total = 0;

    for (const level of book.bids.values()) {
      total += level.quantity;
    }

    return total;
  }

  totalAsk(book: OrderBook) {
    let total = 0;

    for (const level of book.asks.values()) {
      total += level.quantity;
    }

    return total;
  }
}
