"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRateLimit = exports.authRateLimit = void 0;
exports.rateLimit = rateLimit;
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
// In-memory rate limit store (use Redis in production for distributed systems)
const rateLimitStore = new Map();
// Clean up old entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now - entry.firstRequest > config_1.config.rateLimit.windowMs * 2) {
            rateLimitStore.delete(key);
        }
    }
}, 60000); // Clean up every minute
function getClientIdentifier(req) {
    // Use IP address and user ID (if authenticated) for rate limiting
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userId = req.user?.userId;
    return userId ? `${ip}:${userId}` : ip;
}
/**
 * Rate limiting middleware factory
 */
function rateLimit(options = {}) {
    const { windowMs = config_1.config.rateLimit.windowMs, maxRequests = config_1.config.rateLimit.maxRequests, message = 'Too many requests, please try again later', skipSuccessfulRequests = false, keyGenerator = getClientIdentifier, onLimitReached, } = options;
    return (req, res, next) => {
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
            logger_1.logger.security('Rate limit exceeded', {
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
            res.end = function (...args) {
                if (res.statusCode < 400) {
                    entry.count--;
                    rateLimitStore.set(key, entry);
                }
                return originalEnd.apply(this, args);
            };
        }
        next();
    };
}
/**
 * Strict rate limit for authentication endpoints
 */
exports.authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: config_1.config.rateLimit.authMaxRequests,
    message: 'Too many authentication attempts, please try again later',
    onLimitReached: (req) => {
        logger_1.logger.security('Auth rate limit exceeded', {
            ip: req.ip,
            path: req.path,
            email: req.body?.email,
        });
    },
});
/**
 * General API rate limit
 */
exports.apiRateLimit = rateLimit({
    windowMs: config_1.config.rateLimit.windowMs,
    maxRequests: config_1.config.rateLimit.maxRequests,
});
//# sourceMappingURL=rateLimit.js.map