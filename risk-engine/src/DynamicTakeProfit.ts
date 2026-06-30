export class DynamicTakeProfit {
  long(price: number, atr: number) {
    return {
      tp1: price + atr,

      tp2: price + atr * 2,

      tp3: price + atr * 3,
    };
  }

  short(price: number, atr: number) {
    return {
      tp1: price - atr,

      tp2: price - atr * 2,

      tp3: price - atr * 3,
    };
  }
}
