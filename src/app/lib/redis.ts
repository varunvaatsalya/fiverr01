import Redis from "ioredis";

let redis: Redis | null = null;

function createRedisClient() {
  return new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,
    username: process.env.REDIS_USERNAME || "default",
    password: process.env.REDIS_PASSWORD || undefined,
    lazyConnect: true,

    retryStrategy: () => null,
    maxRetriesPerRequest: 1,
  });
}

async function ensureConnection() {
  if (!redis || redis?.status !== "ready") {
    redis = createRedisClient();
    try {
      await redis.connect();
      console.log("Redis connection established successfully.");
    } catch (err) {
      console.warn("Redis connection failed. Running in degraded mode.");
      try {
        redis.disconnect();
      } catch {}
      redis = null;
    }
  }
}

export function isRedisConnected() {
  return redis?.status === "ready";
}

function disconnectRedis() {
  if (redis) {
    redis.disconnect();
    redis = null;
  }
}

export const connectionServices = {
  isRedisConnected: () => {
    return redis?.status === "ready";
  },
  retryConnection: async () => {
    disconnectRedis();
    await ensureConnection();
    return redis?.status === "ready";
  },
  disconnect: () => {
    disconnectRedis();
    return redis === null;
  },
};

export const redisService = {
  async get(key: string): Promise<string | null> {
    try {
      await ensureConnection();
      if (!redis) return null;
      return await redis.get(key);
    } catch (err) {
      console.error("Redis get error:", err);
      disconnectRedis();
      return null;
    }
  },

  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    try {
      await ensureConnection();
      if (!redis) return false;
      if (ttlSeconds) {
        await redis.set(key, value, "EX", ttlSeconds);
      } else {
        await redis.set(key, value);
      }
      return true;
    } catch (err) {
      console.error("Redis set error:", err);
      disconnectRedis();
      return false;
    }
  },

  async del(key: string): Promise<boolean> {
    try {
      await ensureConnection();
      if (!redis) return false;
      const res = await redis.del(key);
      return res > 0;
    } catch (err) {
      console.error("Redis del error:", err);
      disconnectRedis();
      return false;
    }
  },
};

// COMMANDS

// redis-cli
// info memory
