import type { MiddlewareHandler } from "hono";
import { Redis, type RedisOptions } from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
  redisForSub: Redis | undefined;
};
const url =
  process.env.REDIS_URL || process.env.REDIS_URI || "redis://localhost:6379";
if (!url) {
  if (process.env.IS_BUILDING !== "true") {
    throw new Error("REDIS_URL is not set");
  }
}
const parsedURL = new URL(url);

export const redisConfig = {
  host: parsedURL.hostname || "localhost",
  port: Number(parsedURL.port || 6379),
  // database: (parsedURL.pathname || "/0").slice(1) || "0",
  password: parsedURL.password
    ? decodeURIComponent(parsedURL.password)
    : undefined,
  connectTimeout: 10000,
} satisfies RedisOptions;

const getRedis = (): Redis => {
  if (globalForRedis.redis) return globalForRedis.redis;
  const redis = new Redis(url);
  globalForRedis.redis = redis;
  return redis;
};
// 我们为订阅操作创建一个单独的Redis实例，因为当Redis客户端通过SUBSCRIBE或PSUBSCRIBE进入订阅模式后，
// 它将无法执行其他命令。拥有一个专用于发布/订阅操作的实例可以确保我们的主Redis客户端
// 仍然可用于常规操作（如GET、SET等），而订阅客户端则可以处理实时消息和事件通知。
const getRedisForSub = (): Redis => {
  if (globalForRedis.redisForSub) return globalForRedis.redisForSub;
  const redis = new Redis(url);
  globalForRedis.redisForSub = redis;
  return redis;
};
const redis = getRedis();

export default redis;

export const injectRedisForSub: MiddlewareHandler<{
  Variables: {
    redisForSub: Redis;
  };
}> = async (c, next) => {
  c.set("redisForSub", getRedisForSub());
  await next();
};

// Used for trpc subscribing to channels
export const redisForSub = getRedisForSub();
