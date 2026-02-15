"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityHeaders = securityHeaders;
exports.generateCSRFToken = generateCSRFToken;
exports.verifyCSRFToken = verifyCSRFToken;
exports.csrfProtection = csrfProtection;
exports.requestId = requestId;
exports.preventParamPollution = preventParamPollution;
exports.auditLog = auditLog;
exports.detectSuspiciousActivity = detectSuspiciousActivity;
const crypto_1 = __importDefault(require("crypto"));
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
// CSRF token store (use Redis in production)
const csrfTokens = new Map();
function toOrigin(url) {
    try {
        return new URL(url).origin;
    }
    catch {
        return null;
    }
}
function getTrustedOrigins() {
    const origins = new Set();
    config_1.config.corsOrigin
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
        .forEach((origin) => {
        const parsed = toOrigin(origin);
        if (parsed)
            origins.add(parsed);
    });
    const frontendOrigin = toOrigin(config_1.config.frontendUrl);
    if (frontendOrigin) {
        origins.add(frontendOrigin);
    }
    return origins;
}
/**
 * Security headers middleware
 */
function securityHeaders(_req, res, next) {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Enable XSS filter
    res.setHeader('X-XSS-Protection', '1; mode=block');
    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // Permissions policy
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    // Content Security Policy (adjust as needed)
    if (config_1.config.isProduction) {
        res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;");
    }
    // HSTS (HTTP Strict Transport Security)
    if (config_1.config.isProduction) {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    next();
}
/**
 * Generate CSRF token
 */
function generateCSRFToken(sessionId) {
    const token = crypto_1.default.randomBytes(32).toString('hex');
    const expires = Date.now() + 3600000; // 1 hour
    csrfTokens.set(sessionId, { token, expires });
    // Clean up expired tokens
    for (const [key, value] of csrfTokens.entries()) {
        if (Date.now() > value.expires) {
            csrfTokens.delete(key);
        }
    }
    return token;
}
/**
 * Verify CSRF token
 */
function verifyCSRFToken(sessionId, token) {
    const stored = csrfTokens.get(sessionId);
    if (!stored)
        return false;
    if (Date.now() > stored.expires) {
        csrfTokens.delete(sessionId);
        return false;
    }
    // Use constant-time comparison
    return crypto_1.default.timingSafeEqual(Buffer.from(stored.token), Buffer.from(token));
}
/**
 * CSRF protection middleware
 */
function csrfProtection(req, res, next) {
    // Skip CSRF for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }
    // Skip CSRF for API routes with Bearer token (JWT auth)
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        return next();
    }
    // Only enforce CSRF checks for cookie-authenticated requests.
    // This prevents breaking non-cookie API flows (e.g., login/register forms).
    const sessionId = req.cookies?.sessionId ||
        req.cookies?.refreshToken ||
        req.headers['x-session-id'];
    if (!sessionId) {
        return next();
    }
    const csrfToken = req.headers['x-csrf-token'] || req.body?._csrf;
    if (csrfToken) {
        if (!verifyCSRFToken(sessionId, csrfToken)) {
            logger_1.logger.security('CSRF token invalid', { ip: req.ip, path: req.path });
            res.status(403).json({
                success: false,
                error: 'Invalid CSRF token',
            });
            return;
        }
        return next();
    }
    // Fallback hardening for browsers: require trusted Origin/Referer for cookie auth requests.
    const originHeader = req.get('origin');
    const refererHeader = req.get('referer');
    const requestOrigin = originHeader || (refererHeader ? toOrigin(refererHeader) : null);
    const trustedOrigins = getTrustedOrigins();
    if (!requestOrigin || !trustedOrigins.has(requestOrigin)) {
        logger_1.logger.security('CSRF origin check failed', {
            ip: req.ip,
            path: req.path,
            method: req.method,
            requestOrigin: requestOrigin || 'missing',
        });
        res.status(403).json({
            success: false,
            error: 'Invalid request origin',
        });
        return;
    }
    next();
}
/**
 * Request ID middleware for tracing
 */
function requestId(req, res, next) {
    const id = req.headers['x-request-id'] || crypto_1.default.randomUUID();
    req.headers['x-request-id'] = id;
    res.setHeader('X-Request-ID', id);
    next();
}
/**
 * Prevent parameter pollution
 */
function preventParamPollution(req, _res, next) {
    // If query params are arrays, take only the last value
    for (const key of Object.keys(req.query)) {
        if (Array.isArray(req.query[key])) {
            const arr = req.query[key];
            req.query[key] = arr[arr.length - 1];
        }
    }
    next();
}
/**
 * Audit logging middleware
 */
function auditLog(action) {
    return (req, _res, next) => {
        const userId = req.user?.userId || 'anonymous';
        logger_1.logger.audit(action, userId, {
            ip: req.ip,
            path: req.path,
            method: req.method,
            userAgent: req.headers['user-agent'],
        });
        next();
    };
}
/**
 * Suspicious activity detector
 */
function detectSuspiciousActivity(req, res, next) {
    const suspiciousPatterns = [
        /(\%27)|(\')|(\%23)|(#)/i, // SQL injection (avoid false positives on OAuth/base64url query params)
        /((\%3C)|<)((\%2F)|\/)*[a-z0-9\%]+((\%3E)|>)/i, // XSS
        /(\%00)/i, // Null byte injection
        /(\.\.\/)/i, // Path traversal
    ];
    // IMPORTANT:
    // Do not scan the request body for "suspicious" characters (like apostrophes).
    // Legitimate user-generated content (chat, CMS posts, names like O'Connor) will otherwise be blocked.
    // We only apply lightweight checks on the URL/query string here.
    const checkString = req.url;
    for (const pattern of suspiciousPatterns) {
        if (pattern.test(checkString)) {
            logger_1.logger.security('Suspicious request detected', {
                ip: req.ip,
                path: req.path,
                method: req.method,
                pattern: pattern.toString(),
            });
            res.status(400).json({
                success: false,
                error: 'Invalid request',
            });
            return;
        }
    }
    next();
}
//# sourceMappingURL=security.js.map