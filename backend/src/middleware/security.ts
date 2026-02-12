import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { config } from '../config';
import { logger } from '../utils/logger';

// CSRF token store (use Redis in production)
const csrfTokens = new Map<string, { token: string; expires: number }>();

function toOrigin(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

function getTrustedOrigins(): Set<string> {
  const origins = new Set<string>();

  config.corsOrigin
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .forEach((origin) => {
      const parsed = toOrigin(origin);
      if (parsed) origins.add(parsed);
    });

  const frontendOrigin = toOrigin(config.frontendUrl);
  if (frontendOrigin) {
    origins.add(frontendOrigin);
  }

  return origins;
}

/**
 * Security headers middleware
 */
export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
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
  if (config.isProduction) {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
    );
  }

  // HSTS (HTTP Strict Transport Security)
  if (config.isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  next();
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(sessionId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
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
export function verifyCSRFToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId);

  if (!stored) return false;
  if (Date.now() > stored.expires) {
    csrfTokens.delete(sessionId);
    return false;
  }

  // Use constant-time comparison
  return crypto.timingSafeEqual(Buffer.from(stored.token), Buffer.from(token));
}

/**
 * CSRF protection middleware
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
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
  const sessionId =
    (req.cookies?.sessionId as string | undefined) ||
    (req.cookies?.refreshToken as string | undefined) ||
    (req.headers['x-session-id'] as string | undefined);
  if (!sessionId) {
    return next();
  }

  const csrfToken = (req.headers['x-csrf-token'] as string | undefined) || req.body?._csrf;
  if (csrfToken) {
    if (!verifyCSRFToken(sessionId, csrfToken)) {
      logger.security('CSRF token invalid', { ip: req.ip, path: req.path });
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
    logger.security('CSRF origin check failed', {
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
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = req.headers['x-request-id'] as string || crypto.randomUUID();
  req.headers['x-request-id'] = id;
  res.setHeader('X-Request-ID', id);
  next();
}

/**
 * Prevent parameter pollution
 */
export function preventParamPollution(req: Request, _res: Response, next: NextFunction): void {
  // If query params are arrays, take only the last value
  for (const key of Object.keys(req.query)) {
    if (Array.isArray(req.query[key])) {
      const arr = req.query[key] as string[];
      req.query[key] = arr[arr.length - 1];
    }
  }
  next();
}

/**
 * Audit logging middleware
 */
export function auditLog(action: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const userId = (req as any).user?.userId || 'anonymous';
    logger.audit(action, userId, {
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
export function detectSuspiciousActivity(req: Request, res: Response, next: NextFunction): void {
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
      logger.security('Suspicious request detected', {
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
