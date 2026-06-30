/* eslint-disable @typescript-eslint/no-explicit-any */
export interface SignalContext {
  symbol: string;

  indicator: any;

  whale: any;

  liquidity: any;

  market: any;

  correlation?: any;

  funding?: any;

  openInterest?: any;

  liquidation?: any;

  multiTimeframe?: number;
}
