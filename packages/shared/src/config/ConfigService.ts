import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),

  REDIS_URL: z.string(),

  POSTGRES_URL: z.string(),

  LOG_LEVEL: z.string().default("info"),

  APP_NAME: z.string().default("SignalA"),

  BINANCE_SPOT_WS: z.string(),

  BINANCE_FUTURES_WS: z.string(),
});

export class ConfigService {
  readonly env = schema.parse(process.env);

  get<K extends keyof typeof this.env>(key: K) {
    return this.env[key];
  }
}

export const config = new ConfigService();
