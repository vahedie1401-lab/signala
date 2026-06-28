import { env } from "./env";

export class ConfigService {
  readonly nodeEnv = env.NODE_ENV;

  readonly redis = {
    url: env.REDIS_URL,
  };

  readonly postgres = {
    url: env.POSTGRES_URL,
  };

  readonly binance = {
    spot: env.BINANCE_SPOT_WS,
    futures: env.BINANCE_FUTURES_WS,
  };

  readonly logger = {
    level: env.LOG_LEVEL,
  };
}

export const config = new ConfigService();
