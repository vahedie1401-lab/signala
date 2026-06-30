export class SnapshotDownloader {
  constructor(private readonly endpoint: string) {}

  async download(symbol: string): Promise<BinanceDepthSnapshot> {
    const response = await fetch(`${this.endpoint}/fapi/v1/depth?symbol=${symbol}&limit=1000`);

    if (!response.ok) {
      throw new Error("Cannot download snapshot");
    }

    return (await response.json()) as BinanceDepthSnapshot;
  }
}

export interface BinanceDepthSnapshot {
  lastUpdateId: number;

  bids: [string, string][];

  asks: [string, string][];
}
