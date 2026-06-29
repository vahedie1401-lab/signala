export class OrderBookLevel {
  constructor(
    public readonly price: number,

    public quantity: number,
  ) {}

  update(quantity: number): void {
    this.quantity = quantity;
  }

  clone(): OrderBookLevel {
    return new OrderBookLevel(
      this.price,

      this.quantity,
    );
  }
}
