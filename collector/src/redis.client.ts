import Redis from "ioredis";

export const redis = new Redis({
  host: process.env.REDIS_HOST || "tiny-exemplary-rapid-14089.db.redis.io", // || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 17715, // || 6379,
  maxRetriesPerRequest: null,
  username: "default",
  password: "orhslpOMPQSUv5L4b8MPaqBMdF8SgCuL",
});

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("error", (err) => {
  console.log("Redis error:", err.message);
});
