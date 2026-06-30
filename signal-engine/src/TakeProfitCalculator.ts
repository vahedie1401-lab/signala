export class TakeProfitCalculator {
  long(
    price: number,

    atr: number,
  ) {
    return price + atr * 3;
  }

  short(
    price: number,

    atr: number,
  ) {
    return price - atr * 3;
  }
}
