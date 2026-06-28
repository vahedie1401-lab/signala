import { RedisStream } from "../streams";

export class RedisBus {
  publishTrade<T>(symbol: string, data: T): Promise<string> {
    const stream = new RedisStream(`stream:trades:${symbol}`);
    return stream.publish(data);
  }

  publishFeature<T>(symbol: string, data: T): Promise<string> {
    const stream = new RedisStream(`stream:features:${symbol}`);
    return stream.publish(data);
  }

  publishSignal<T>(symbol: string, data: T): Promise<string> {
    const stream = new RedisStream(`stream:signals:${symbol}`);
    return stream.publish(data);
  }

  publishMarket<T>(symbol: string, data: T): Promise<string> {
    const stream = new RedisStream(`stream:market:${symbol}`);
    return stream.publish(data);
  }
}

export const bus = new RedisBus();
