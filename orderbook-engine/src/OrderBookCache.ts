import { OrderBook } from "./OrderBook";

export class OrderBookCache {
  private readonly books = new Map<string, OrderBook>();

  get(symbol: string) {
    let book = this.books.get(symbol);

    if (!book) {
      book = new OrderBook();

      this.books.set(
        symbol,

        book,
      );
    }

    return book;
  }

  values() {
    return [...this.books.values()];
  }
}
