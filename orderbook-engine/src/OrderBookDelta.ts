import { OrderBookLevel } from "./OrderBookLevel";

export class OrderBookDelta {
  constructor(
    public readonly firstUpdateId: number,

    public readonly finalUpdateId: number,

    public readonly bids: OrderBookLevel[],

    public readonly asks: OrderBookLevel[],
  ) {}
}
