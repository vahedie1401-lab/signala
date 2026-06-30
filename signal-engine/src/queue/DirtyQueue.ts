export class DirtyQueue {
  private readonly symbols = new Set<string>();

  add(symbol: string): void {
    this.symbols.add(symbol);
  }

  pop(): string | undefined {
    const value = this.symbols.values().next().value;

    if (value === undefined) {
      return;
    }

    this.symbols.delete(value);

    return value;
  }

  size(): number {
    return this.symbols.size;
  }
}
