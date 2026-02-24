import { getRedisClient } from './redis';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const redis = getRedisClient();
  
  if (!redis) {
    return {
      allowed: true,
      remaining: limit,
      resetAt: new Date(Date.now() + windowSeconds * 1000),
    };
  }
  
  try {
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;
    const sortedSetKey = `ratelimit:${key}`;
    
    const pipeline = redis.pipeline();
    pipeline.zremrangebyscore(sortedSetKey, 0, windowStart);
    pipeline.zcard(sortedSetKey);
    pipeline.zadd(sortedSetKey, now, `${now}`);
    pipeline.expire(sortedSetKey, windowSeconds);
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Redis timeout')), 200);
    });
    
    const results = await Promise.race([
      pipeline.exec(),
      timeoutPromise
    ]) as any;
    
    if (!results) {
      throw new Error('Pipeline execution failed');
    }
    
    const countResult = results[1];
    if (!countResult || countResult[0]) {
      throw new Error('Failed to get count from pipeline');
    }
    
    const currentCount = (countResult[1] as number) || 0;
    const allowed = currentCount < limit;
    const remaining = Math.max(0, limit - currentCount - 1);
    const resetAt = new Date(now + windowSeconds * 1000);
    
    return {
      allowed,
      remaining: allowed ? remaining : 0,
      resetAt,
    };
  } catch (error) {
    console.error(`Rate limit check error (${key}):`, error);
    
    return {
      allowed: true,
      remaining: limit,
      resetAt: new Date(Date.now() + windowSeconds * 1000),
    };
  }
}
