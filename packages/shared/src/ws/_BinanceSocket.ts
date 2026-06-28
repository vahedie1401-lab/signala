// import { WebSocketManager } from "./WebSocketManager";

// export interface BinanceTradeSubscription {
//   symbol: string;
// }

// export interface BinanceDepthSubscription {
//   symbol: string;
//   level?: 5 | 10 | 20;
// }

// export class BinanceSocket extends WebSocketManager {
//   constructor(stream: string) {
//     super({
//       url: `wss://stream.binance.com:9443/ws/${stream}`,
//       reconnect: true,
//       reconnectDelay: 3000,
//       heartbeatInterval: 15000,
//       maxReconnectAttempts: Infinity,
//     });
//   }

//   static trade(symbol: string) {
//     return new BinanceSocket(`${symbol.toLowerCase()}@trade`);
//   }

//   static aggTrade(symbol: string) {
//     return new BinanceSocket(`${symbol.toLowerCase()}@aggTrade`);
//   }

//   static bookTicker(symbol: string) {
//     return new BinanceSocket(`${symbol.toLowerCase()}@bookTicker`);
//   }

//   static depth(symbol: string, level: 5 | 10 | 20 = 20) {
//     return new BinanceSocket(`${symbol.toLowerCase()}@depth${level}@100ms`);
//   }

//   static kline(symbol: string, interval = "1m") {
//     return new BinanceSocket(`${symbol.toLowerCase()}@kline_${interval}`);
//   }

//   static liquidation(symbol: string) {
//     return new BinanceSocket(`${symbol.toLowerCase()}@forceOrder`);
//   }

//   static markPrice(symbol: string) {
//     return new BinanceSocket(`${symbol.toLowerCase()}@markPrice@1s`);
//   }
// }
