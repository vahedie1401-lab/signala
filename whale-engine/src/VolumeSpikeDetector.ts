export class VolumeSpikeDetector {
  private readonly history: number[] = [];

  constructor(private readonly window = 50) {}

  update(volume: number) {
    this.history.push(volume);

    if (this.history.length > this.window) {
      this.history.shift();
    }
  }

  score(volume: number) {
    if (this.history.length === 0) return 0;

    const avg =
      this.history.reduce(
        (a, b) => a + b,

        0,
      ) / this.history.length;

    if (avg === 0) return 0;

    return volume / avg;
  }
}
