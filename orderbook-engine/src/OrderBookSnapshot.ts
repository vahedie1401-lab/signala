import { OrderBookLevel } from "./OrderBookLevel";

export class OrderBookSnapshot {
  constructor(
    public readonly symbol: string,

    public readonly exchange: string,

    public readonly timestamp: number,

    public readonly lastUpdateId: number,

    public readonly bids: OrderBookLevel[],

    public readonly asks: OrderBookLevel[],
  ) {}

  bestBid(): OrderBookLevel | undefined {
    return this.bids[0];
  }

  bestAsk(): OrderBookLevel | undefined {
    return this.asks[0];
  }

  spread(): number {
    if (this.bids.length === 0 || this.asks.length === 0) {
      return 0;
    }

    const asksPrice = this.asks[0]?.price ?? 0;
    const bidsPrice = this.bids[0]?.price ?? 0;

    return asksPrice - bidsPrice;
  }

  midPrice(): number {
    if (this.bids.length === 0 || this.asks.length === 0) {
      return 0;
    }

    const asksPrice = this.asks[0]?.price ?? 0;
    const bidsPrice = this.bids[0]?.price ?? 0;

    return (bidsPrice + asksPrice) / 2;
  }
}
