export interface Indicator<T> {
  update(price: number): void;

  value(): T;
}
