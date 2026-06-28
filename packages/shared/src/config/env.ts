import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const schema = z.object({
  NODE_ENV: z.string().default("development"),

  REDIS_URL: z.string(),

  POSTGRES_URL: z.string(),

  BINANCE_SPOT_WS: z.string(),

  BINANCE_FUTURES_WS: z.string(),

  LOG_LEVEL: z.string().default("info"),
});

export const env = schema.parse(process.env);
