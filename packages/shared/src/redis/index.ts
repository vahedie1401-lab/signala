import Redis from "ioredis";

import { config } from "../config";

export const redis = new Redis(config.get("REDIS_URL"), {
  lazyConnect: true,

  maxRetriesPerRequest: null,

  enableReadyCheck: false,
});
