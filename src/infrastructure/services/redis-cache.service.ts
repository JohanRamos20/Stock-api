import { ICacheService } from "@domain/services/cache.service";
import { redisClient } from "@database/redis";

export class RedisCacheService implements ICacheService {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await redisClient.get(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch (err) {
      console.error("RedisCacheService.get error", err);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    try {
      await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
    } catch (err) {
      console.error("RedisCacheService.set error", err);
    }
  }

  async invalidate(prefix: string): Promise<void> {
    try {
      const keys: string[] = [];
      for await (const batch of redisClient.scanIterator({ MATCH: `${prefix}*` })) {
        keys.push(...batch);
      }
      if (keys.length > 0) await Promise.all(keys.map((key) => redisClient.del(key)));
    } catch (err) {
      console.error("RedisCacheService.invalidate error", err);
    }
  }
}
