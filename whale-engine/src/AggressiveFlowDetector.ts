export class AggressiveFlowDetector {
  detect(buyMarketOrders: number, sellMarketOrders: number) {
    const total = buyMarketOrders + sellMarketOrders;

    if (total === 0) {
      return 0;
    }

    return (buyMarketOrders - sellMarketOrders) / total;
  }
}
