export interface EngineMessage<T> {
  engine: string;

  symbol: string;

  data: T;

  timestamp: number;
}
