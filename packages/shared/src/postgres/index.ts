import postgres from "postgres";

import { config } from "../config";

export const sql = postgres(config.get("POSTGRES_URL"), {
  max: 20,

  idle_timeout: 20,

  connect_timeout: 10,
});
