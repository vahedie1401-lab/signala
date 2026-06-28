// import { BaseEngine } from "./BaseEngine";

// export class HealthManager {
//   private readonly engines = new Map<string, BaseEngine>();

//   register(name: string, engine: BaseEngine) {
//     this.engines.set(name, engine);
//   }

//   get(name: string) {
//     return this.engines.get(name);
//   }

//   all() {
//     return [...this.engines.entries()].map(([name, engine]) => ({
//       name,

//       ...engine.status(),
//     }));
//   }
// }
