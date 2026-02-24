import Redis from 'ioredis';

let redis: Redis | null = null;

if (process.env.REDIS_URL) {
  try {
    let redisUrl = process.env.REDIS_URL.trim();
    
    // Clean up malformed URLs (remove redis-cli prefix if present)
    if (redisUrl.includes('redis-cli')) {
      const match = redisUrl.match(/redis:\/\/.+/);
      if (match) {
        redisUrl = match[0];
      }
    }
    
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      connectTimeout: 5000,
      retryStrategy(times) {
        if (times > 3) {
          console.log('⚠️  Redis max retries reached, disabling Redis');
          return null;
        }
        return Math.min(times * 50, 2000);
      },
    });
    
    redis.on('connect', () => {
      console.log('✅ Redis connected');
    });
    
    redis.on('error', (err) => {
      console.warn('⚠️  Redis error:', err.message);
      // Don't set redis to null here, let it retry
    });
    
    redis.on('close', () => {
      console.warn('⚠️  Redis connection closed');
    });
    
  } catch (error) {
    console.warn('⚠️  Failed to initialize Redis, running without cache');
    redis = null;
  }
} else {
  console.log('⚠️  No REDIS_URL provided, caching disabled');
}

export async function get<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  
  try {
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 100);
    });
    
    const getPromise = redis.get(key).then(value => {
      if (!value) return null;
      return JSON.parse(value) as T;
    });
    
    return await Promise.race([getPromise, timeoutPromise]);
  } catch (error) {
    console.error(`Redis GET error (${key}):`, error);
    return null;
  }
}

export async function set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
  if (!redis) return false;
  
  try {
    const serialized = JSON.stringify(value);
    
    if (ttlSeconds) {
      await redis.setex(key, ttlSeconds, serialized);
    } else {
      await redis.set(key, serialized);
    }
    
    return true;
  } catch (error) {
    console.error(`Redis SET error (${key}):`, error);
    return false;
  }
}

export async function del(key: string): Promise<boolean> {
  if (!redis) return false;
  
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error(`Redis DEL error (${key}):`, error);
    return false;
  }
}

export async function increment(key: string, ttlSeconds?: number): Promise<number | null> {
  if (!redis) return null;
  
  try {
    const value = await redis.incr(key);
    
    if (ttlSeconds && value === 1) {
      await redis.expire(key, ttlSeconds);
    }
    
    return value;
  } catch (error) {
    console.error(`Redis INCR error (${key}):`, error);
    return null;
  }
}

export function getRedisClient(): Redis | null {
  return redis;
}
