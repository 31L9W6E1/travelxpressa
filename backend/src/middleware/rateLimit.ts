import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { logger } from '../utils/logger';

interface RateLimitEntry {
  count: number;
  firstRequest: number;
  blockedUntil?: number;
}

// In-memory rate limit store (use Redis in production for distributed systems)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.firstRequest > config.rateLimit.windowMs * 2) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

function getClientIdentifier(req: Request): string {
  // Use IP address and user ID (if authenticated) for rate limiting
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const userId = (req as any).user?.userId;
  return userId ? `${ip}:${userId}` : ip;
}

interface RateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  onLimitReached?: (req: Request, res: Response) => void;
}

/**
 * Rate limiting middleware factory
 */
export function rateLimit(options: RateLimitOptions = {}) {
  const {
    windowMs = config.rateLimit.windowMs,
    maxRequests = config.rateLimit.maxRequests,
    message = 'Too many requests, please try again later',
    skipSuccessfulRequests = false,
    keyGenerator = getClientIdentifier,
    onLimitReached,
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();

    let entry = rateLimitStore.get(key);

    // Check if blocked
    if (entry?.blockedUntil && now < entry.blockedUntil) {
      const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      res.set('X-RateLimit-Limit', String(maxRequests));
      res.set('X-RateLimit-Remaining', '0');
      res.set('X-RateLimit-Reset', String(Math.ceil(entry.blockedUntil / 1000)));

      if (onLimitReached) {
        onLimitReached(req, res);
      }

      return res.status(429).json({
        success: false,
        error: message,
        retryAfter,
      });
    }

    // Reset if window has passed
    if (!entry || now - entry.firstRequest > windowMs) {
      entry = { count: 0, firstRequest: now };
    }

    entry.count++;
    rateLimitStore.set(key, entry);

    // Check if limit exceeded
    if (entry.count > maxRequests) {
      entry.blockedUntil = now + windowMs;
      rateLimitStore.set(key, entry);

      logger.security('Rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        key,
      });

      const retryAfter = Math.ceil(windowMs / 1000);
      res.set('Retry-After', String(retryAfter));
      res.set('X-RateLimit-Limit', String(maxRequests));
      res.set('X-RateLimit-Remaining', '0');
      res.set('X-RateLimit-Reset', String(Math.ceil((now + windowMs) / 1000)));

      if (onLimitReached) {
        onLimitReached(req, res);
      }

      return res.status(429).json({
        success: false,
        error: message,
        retryAfter,
      });
    }

    // Set rate limit headers
    const remaining = Math.max(0, maxRequests - entry.count);
    res.set('X-RateLimit-Limit', String(maxRequests));
    res.set('X-RateLimit-Remaining', String(remaining));
    res.set('X-RateLimit-Reset', String(Math.ceil((entry.firstRequest + windowMs) / 1000)));

    // Optionally skip counting successful requests
    if (skipSuccessfulRequests) {
      const originalEnd = res.end;
      res.end = function(this: Response, ...args: Parameters<typeof originalEnd>) {
        if (res.statusCode < 400) {
          entry!.count--;
          rateLimitStore.set(key, entry!);
        }
        return originalEnd.apply(this, args);
      } as typeof originalEnd;
    }

    next();
  };
}

/**
 * Strict rate limit for authentication endpoints
 * Only counts failed requests (4xx/5xx) - successful logins don't count against the limit
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: config.rateLimit.authMaxRequests,
  message: 'Too many authentication attempts, please try again later',
  skipSuccessfulRequests: true, // Don't count successful requests (2xx/3xx)
  onLimitReached: (req) => {
    logger.security('Auth rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      email: req.body?.email,
    });
  },
});

/**
 * General API rate limit
 */
export const apiRateLimit = rateLimit({
  windowMs: config.rateLimit.windowMs,
  maxRequests: config.rateLimit.maxRequests,
});
