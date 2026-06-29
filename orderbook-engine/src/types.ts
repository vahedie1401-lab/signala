export interface BookLevel {
  price: number;

  quantity: number;
}

export interface OrderBookSnapshot {
  symbol: string;

  exchange: string;

  timestamp: number;

  lastUpdateId: number;

  bids: BookLevel[];

  asks: BookLevel[];
}

export interface DepthUpdate {
  firstUpdateId: number;

  finalUpdateId: number;

  bids: BookLevel[];

  asks: BookLevel[];
}
