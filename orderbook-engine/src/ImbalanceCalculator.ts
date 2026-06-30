export class ImbalanceCalculator {
  calculate(
    bid: number,

    ask: number,
  ) {
    if (bid + ask === 0) {
      return 0;
    }

    return (bid - ask) / (bid + ask);
  }
}
