export class SignalFilter {
  accept(score: number) {
    return score >= 70;
  }
}
