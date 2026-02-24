import type { Request, Response, NextFunction } from 'express';
import { checkRateLimit } from '../utils/rateLimit';

function getClientIp(req: Request): string {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
    if (ips && typeof ips === 'string') {
      const firstIp = ips.split(',')[0]?.trim();
      if (firstIp) return firstIp;
    }
  }
  
  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    const ip = Array.isArray(realIp) ? realIp[0] : realIp;
    if (ip) return ip;
  }
  
  return req.socket.remoteAddress || 'unknown';
}

export function rateLimit(
  limit: number,
  windowSeconds: number,
  keyFn?: (req: Request) => string
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const identifier = keyFn ? keyFn(req) : getClientIp(req);
      const key = identifier;
      
      const result = await checkRateLimit(key, limit, windowSeconds);
      
      res.setHeader('X-RateLimit-Limit', limit.toString());
      res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
      res.setHeader('X-RateLimit-Reset', result.resetAt.toISOString());
      
      if (!result.allowed) {
        return res.status(429).json({
          success: false,
          message: 'Too many requests, please try again later.',
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            resetAt: result.resetAt,
          },
        });
      }
      
      next();
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      next();
    }
  };
}
