import redisClient from '../utils/redis';

export class CacheService {
  // Get cached data
  static async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await redisClient.get(key);
      if (cached) {
        return JSON.parse(cached) as T;
      }
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // Set cache with expiration
  static async set(key: string, value: any, expirationSeconds: number): Promise<void> {
    try {
      await redisClient.setEx(
        key,
        expirationSeconds,
        JSON.stringify(value)
      )
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  static async delete(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  // clear all cache
  static async clear(): Promise<void> {
    try {
      await redisClient.flushAll();
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
}
