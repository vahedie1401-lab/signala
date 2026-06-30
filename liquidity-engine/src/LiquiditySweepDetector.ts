export class LiquiditySweepDetector {
  detect(
    previousBid: number,

    currentBid: number,

    previousAsk: number,

    currentAsk: number,
  ): boolean {
    if (previousBid === 0 || previousAsk === 0) {
      return false;
    }

    const bidDrop = currentBid / previousBid;

    const askDrop = currentAsk / previousAsk;

    return bidDrop < 0.4 || askDrop < 0.4;
  }
}
