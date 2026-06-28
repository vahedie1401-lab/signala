import pino from "pino";

import { config } from "../config";

export const logger = pino({
  name: config.get("APP_NAME"),

  level: config.get("LOG_LEVEL"),

  ...(process.env.NODE_ENV === "development" && {
    transport: { target: "pino-pretty" },
  }),

  //  transport:
  //   process.env.NODE_ENV === "development"
  //     ? {
  //         target: "pino-pretty",
  //       }
  //     : undefined,
});
