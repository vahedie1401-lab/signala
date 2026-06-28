export interface OrderBookLevel {
  price: number;

  volume: number;
}

export interface OrderBookSnapshot {
  symbol: string;

  bids: OrderBookLevel[];

  asks: OrderBookLevel[];

  timestamp: number;
}
