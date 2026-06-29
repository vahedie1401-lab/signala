import { BaseEngine, WebSocketManager } from "@signala/shared";

import { OrderBookCache } from "./OrderBookCache";

import { OrderBookPublisher } from "./OrderBookPublisher";

export class OrderBookEngine extends BaseEngine {
  private readonly cache = new OrderBookCache();

  private readonly publisher = new OrderBookPublisher();

  private ws!: WebSocketManager;

  name() {
    return "OrderBookEngine";
  }

  protected async initialize() {
    this.ws = new WebSocketManager({
      url: "wss://fstream.binance.com/ws",
    });

    this.ws.connect();

    this.ws.subscribe("btcusdt@depth@100ms");
  }

  protected async run() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.ws.on((event: any) => {
      const book = this.cache.get(event.s);

      book.applyDelta({
        firstUpdateId: event.U,

        finalUpdateId: event.u,

        bids: event.b.map(([p, q]: string[]) => ({
          price: p ? +p : 0,

          quantity: q ? +q : 0,
        })),

        asks: event.a.map(([p, q]: string[]) => ({
          price: p ? +p : 0,

          quantity: q ? +q : 0,
        })),
      });

      void this.publisher.publish({
        symbol: event.s,

        spread: book.spread(),

        bestBid: book.bestBid(),

        bestAsk: book.bestAsk(),
      });
    });
  }

  protected async shutdown() {
    this.ws.disconnect();
  }
}
