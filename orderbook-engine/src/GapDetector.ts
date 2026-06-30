export class GapDetector {
  detect(
    previous: number,

    current: number,
  ) {
    return current != previous + 1;
  }
}
