export class WalletTracker {
  private readonly wallets = new Map<string, number>();

  add(wallet: string, usd: number) {
    const value = this.wallets.get(wallet) ?? 0;

    this.wallets.set(wallet, value + usd);
  }

  score(wallet: string) {
    return this.wallets.get(wallet) ?? 0;
  }
}
