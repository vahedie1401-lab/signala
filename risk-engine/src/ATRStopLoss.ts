export class ATRStopLoss {
  long(price: number, atr: number) {
    return price - atr * 1.5;
  }

  short(price: number, atr: number) {
    return price + atr * 1.5;
  }
}
