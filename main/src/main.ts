import { EngineManager, logger, gracefulShutdown } from "@signala/shared";

import { FeatureEngine } from "@signala/feature-engine";
import { IndicatorEngine } from "@signala/indicator-engine";
import { WhaleEngine } from "@signala/whale-engine";
import { LiquidityEngine } from "@signala/liquidity-engine";
import { MarketStateEngine } from "@signala/market-state-engine";
import { SignalEngine } from "@signala/signal-engine";
import { RiskEngine } from "@signala/risk-engine";
import { NotificationEngine } from "@signala/notification-engine";

async function bootstrap() {
  const manager = new EngineManager();

  manager.register(new FeatureEngine());
  manager.register(new IndicatorEngine());
  manager.register(new WhaleEngine());
  manager.register(new LiquidityEngine());
  manager.register(new MarketStateEngine());
  manager.register(new SignalEngine());
  manager.register(new RiskEngine());
  manager.register(new NotificationEngine());

  process.on("SIGINT", () => void manager.stopAll());
  process.on("SIGTERM", () => void manager.stopAll());
  gracefulShutdown();
  await manager.startAll();
}

bootstrap().catch((error) => {
  logger.error({ error }, "main: failed to bootstrap engines");

  process.exit(1);
});
