import { RedisStream } from "../streams";
import { Topics } from "./Topics";

export class RedisBus {
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
}

export const bus = new RedisBus();
