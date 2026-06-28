import postgres from "postgres";
import { env } from "../config";

export const sql = postgres(env.POSTGRES_URL, {
  max: 20,

  idle_timeout: 20,

  connect_timeout: 10,
});
