import { OrderBook } from "./OrderBook";

import { DeltaBuffer } from "./DeltaBuffer";

import { SequenceValidator } from "./SequenceValidator";

import { SnapshotDownloader } from "./SnapshotDownloader";

import { SyncState } from "./SyncState";

import { OrderBookDelta } from "./OrderBookDelta";

import { OrderBookLevel } from "./OrderBookLevel";

import { OrderBookSnapshot } from "./OrderBookSnapshot";

export class OrderBookSynchronizer {
  readonly validator = new SequenceValidator();

  readonly buffer = new DeltaBuffer();

  readonly downloader = new SnapshotDownloader("https://fapi.binance.com");

  state = SyncState.DISCONNECTED;

  constructor(private readonly book: OrderBook) {}

  async synchronize(symbol: string): Promise<void> {
    this.state = SyncState.WAITING_SNAPSHOT;

    const snapshot = await this.downloader.download(symbol);

    const bookSnapshot = new OrderBookSnapshot(
      symbol,

      "binance",

      Date.now(),

      snapshot.lastUpdateId,

      snapshot.bids.map(
        ([p, q]: string[]) =>
          new OrderBookLevel(
            Number(p),

            Number(q),
          ),
      ),

      snapshot.asks.map(
        ([p, q]: string[]) =>
          new OrderBookLevel(
            Number(p),

            Number(q),
          ),
      ),
    );

    this.book.applySnapshot(bookSnapshot);

    this.buffer.removeUntil(snapshot.lastUpdateId);

    for (const delta of this.buffer.values()) {
      if (this.validator.validate(snapshot.lastUpdateId, delta)) {
        this.book.applyDelta(delta);
      }
    }

    this.state = SyncState.SYNCHRONIZED;
  }

  onDelta(delta: OrderBookDelta): void {
    if (this.state !== SyncState.SYNCHRONIZED) {
      this.buffer.push(delta);

      return;
    }

    this.book.applyDelta(delta);
  }
}
