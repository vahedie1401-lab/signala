import { EngineManager } from "@signala/shared/core";
import { LifecycleManager } from "@signala/shared/core";

// import { CollectorEngine } from "@collector";
// import { FeatureEngine } from "@feature-engine";
// import { WhaleEngine } from "@whale-engine";
// import { LiquidityEngine } from "@liquidity-engine";
// import { MarketStateEngine } from "@market-state-engine";
// import { SignalEngine } from "@signal-engine";

async function bootstrap() {
  const manager = new EngineManager();

  //   manager.register(new CollectorEngine());

  //   manager.register(new FeatureEngine());

  //   manager.register(new WhaleEngine());

  //   manager.register(new LiquidityEngine());

  //   manager.register(new MarketStateEngine());

  //   manager.register(new SignalEngine());

  const lifecycle = new LifecycleManager(manager);

  lifecycle.listen();

  await manager.start();
}

bootstrap();
