import Redis from "ioredis";

let redis: Redis | null = null;

try {
  redis = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,
    username: process.env.REDIS_USERNAME || "default",
    password: process.env.REDIS_PASSWORD || undefined,
    lazyConnect: true,
  });

  // Try to connect in background
  redis
    .connect()
    .then(() => {
      console.log("Redis connection established successfully.");
    })
    .catch(() => {
      console.warn("Redis connection failed. Running in degraded mode.");
      redis = null;
    });
} catch (err) {
  console.warn("Redis init error:", err);
  redis = null;
}

export const redisService = {
  async get(key: string): Promise<string | null> {
    try {
      if (!redis) return null;
      return await redis.get(key);
    } catch {
      return null;
    }
  },

  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    try {
      if (!redis) return false;
      if (ttlSeconds) {
        await redis.set(key, value, "EX", ttlSeconds);
      } else {
        await redis.set(key, value);
      }
      return true;
    } catch {
      return false;
    }
  },

  async del(key: string): Promise<boolean> {
    try {
      if (!redis) return false;
      const res = await redis.del(key);
      return res > 0;
    } catch {
      return false;
    }
  },
};
