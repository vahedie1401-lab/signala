import { RedisStream } from "../streams";
import { Topics } from "./Topics";

export class RedisBus {
  readonly trade = new RedisStream("trade");

  readonly trades = new RedisStream(Topics.TRADES);

  readonly features = new RedisStream(Topics.FEATURES);

  readonly whales = new RedisStream(Topics.WHALES);

  readonly liquidity = new RedisStream(Topics.LIQUIDITY);

  readonly market = new RedisStream(Topics.MARKET);

  readonly signals = new RedisStream(Topics.SIGNALS);

  readonly orderBook = new RedisStream("orderbook-stream");

  readonly funding = new RedisStream("funding-stream");

  readonly openInterest = new RedisStream("open-interest-stream");

  readonly liquidation = new RedisStream("liquidation-stream");

  readonly risk = new RedisStream("risk");

  readonly indicators = new RedisStream(Topics.INDICATORS);

  readonly notifications = new RedisStream(Topics.NOTIFICATIONS);
  //

  // readonly depth = new RedisStream(Topics.DEPTH);

  // readonly bookTicker = new RedisStream(Topics.BOOK_TICKER);

  // readonly markPrice = new RedisStream(Topics.MARK_PRICE);

  // readonly kline = new RedisStream(Topics.KLINE);
}

export const bus = new RedisBus();
