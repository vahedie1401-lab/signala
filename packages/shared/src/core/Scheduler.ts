export class Scheduler {
  every(ms: number, fn: () => void) {
    return setInterval(fn, ms);
  }

  once(ms: number, fn: () => void) {
    return setTimeout(fn, ms);
  }
}
