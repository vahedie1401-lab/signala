// class Metrics {
//   private counters = new Map<string, number>();

//   increment(name: string, value = 1): void {
//     const current = this.counters.get(name) ?? 0;

//     this.counters.set(name, current + value);
//   }

//   counter(name: string): number {
//     return this.counters.get(name) ?? 0;
//   }

//   observe(name: string, value: number): void {
//     this.counters.set(name, value);
//   }

//   timer(name: string): () => void {
//     const start = performance.now();

//     return () => {
//       const duration = performance.now() - start;

//       this.observe(name, duration);
//     };
//   }
// }

// export const metrics = new Metrics();
