import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { validate } from '../middleware/validate';
import {
  authenticateToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from '../middleware/auth';
import {
  asyncHandler,
  BadRequestError,
  UnauthorizedError,
  ConflictError
} from '../middleware/errorHandler';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validation/schemas';
import { UserRole, AuthenticatedRequest } from '../types';
import { logger } from '../utils/logger';
import { config } from '../config';
import { hash } from '../utils/encryption';

const router = Router();

// OAuth Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || '';
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || '';

const BCRYPT_ROUNDS = 12;
const MAX_FAILED_LOGINS = 100; // Increased for development
const LOCKOUT_DURATION_MS = 1 * 60 * 1000; // 1 minute in development

function toOrigin(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

function getAllowedFrontendOrigins(): Set<string> {
  const origins = new Set<string>();

  if (process.env.FRONTEND_URL) {
    const frontendOrigin = toOrigin(process.env.FRONTEND_URL);
    if (frontendOrigin) origins.add(frontendOrigin);
  }

  config.corsOrigin
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .forEach((value) => {
      const corsOrigin = toOrigin(value);
      if (corsOrigin) origins.add(corsOrigin);
    });

  return origins;
}

function getFrontendBaseUrl(req: Request): string {
  const allowedOrigins = getAllowedFrontendOrigins();

  const origin = req.get('origin');
  if (origin) {
    const normalizedOrigin = origin.replace(/\/+$/, '');
    if (allowedOrigins.has(normalizedOrigin)) {
      return normalizedOrigin;
    }
  }

  const referer = req.get('referer');
  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      if (allowedOrigins.has(refererOrigin)) {
        return refererOrigin;
      }
    } catch {
      // Ignore malformed referer and continue to fallback.
    }
  }

  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL.replace(/\/+$/, '');
  }

  const firstCorsOrigin = config.corsOrigin
    .split(',')
    .map((value) => value.trim())
    .find(Boolean);

  if (firstCorsOrigin) {
    return firstCorsOrigin.replace(/\/+$/, '');
  }

  return 'http://localhost:5173';
}

function encodeOAuthState(frontendBaseUrl: string): string {
  return Buffer.from(
    JSON.stringify({
      nonce: crypto.randomBytes(16).toString('hex'),
      frontendBaseUrl,
    })
  ).toString('base64url');
}

function getFrontendBaseUrlFromState(state: unknown, req: Request): string {
  const stateValue = Array.isArray(state) ? state[0] : state;

  if (typeof stateValue === 'string' && stateValue.length > 0) {
    try {
      const decoded = JSON.parse(Buffer.from(stateValue, 'base64url').toString('utf8')) as {
        frontendBaseUrl?: string;
      };

      if (decoded.frontendBaseUrl) {
        const redirectOrigin = toOrigin(decoded.frontendBaseUrl);
        if (redirectOrigin && getAllowedFrontendOrigins().has(redirectOrigin)) {
          return redirectOrigin;
        }
      }
    } catch {
      // Ignore state parsing errors and use fallback.
    }
  }

  return getFrontendBaseUrl(req);
}

function getBackendBaseUrl(req: Request): string {
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL.replace(/\/+$/, '');
  }

  const forwardedProto = req.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const forwardedHost = req.get('x-forwarded-host')?.split(',')[0]?.trim();

  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return `${req.protocol}://${req.get('host')}`;
}

function getCookieDomain(): string | undefined {
  const explicitDomain = (process.env.COOKIE_DOMAIN || '').trim();
  if (explicitDomain) {
    const normalized = explicitDomain.replace(/^\./, '').toLowerCase();
    if (!normalized || normalized === 'localhost' || normalized === '127.0.0.1') {
      return undefined;
    }
    return `.${normalized}`;
  }

  const candidateUrls = [process.env.FRONTEND_URL, process.env.BACKEND_URL].filter(Boolean) as string[];
  for (const value of candidateUrls) {
    try {
      const hostname = new URL(value).hostname.toLowerCase();
      if (hostname.endsWith('travelxpressa.com')) {
        return '.travelxpressa.com';
      }
    } catch {
      // Ignore malformed URL and continue.
    }
  }

  return undefined;
}

const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function hashRefreshToken(token: string): string {
  return hash(token);
}

function refreshTokenLookupCandidates(token: string): string[] {
  const hashedToken = hashRefreshToken(token);
  return hashedToken === token ? [token] : [hashedToken, token];
}

function setRefreshTokenCookie(res: Response, token: string): void {
  const cookieDomain = getCookieDomain();
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'lax',
    ...(cookieDomain ? { domain: cookieDomain } : {}),
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
  });
}

function clearRefreshTokenCookie(res: Response): void {
  const cookieDomain = getCookieDomain();
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'lax',
    ...(cookieDomain ? { domain: cookieDomain } : {}),
  });
}

/**
 * Register a new user
 */
router.post(
  '/register',
  validate({ body: registerSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictError('An account with this email already exists');
    }

    // Hash password with strong cost factor
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || email.split('@')[0],
        role: UserRole.USER,
      },
    });

    // Generate tokens
    const tokenPayload = { userId: user.id, email: user.email, role: user.role as UserRole };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token
    const refreshTokenExpiry = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS);
    await prisma.refreshToken.create({
      data: {
        token: hashRefreshToken(refreshToken),
        userId: user.id,
        expiresAt: refreshTokenExpiry,
      },
    });

    logger.info('User registered', { userId: user.id, email: user.email });

    setRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        accessToken,
        refreshToken: config.isProduction ? undefined : refreshToken,
      },
    });
  })
);

/**
 * Login user
 */
router.post(
  '/login',
  validate({ body: loginSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const clientIp = req.ip || req.socket.remoteAddress;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Use constant-time comparison even for non-existent users
      await bcrypt.compare(password, '$2a$12$invalid.hash.to.prevent.timing.attacks');
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMs = user.lockedUntil.getTime() - Date.now();
      const remainingMins = Math.ceil(remainingMs / 60000);
      logger.security('Login attempt on locked account', { email, ip: clientIp });
      throw new UnauthorizedError(`Account is locked. Try again in ${remainingMins} minutes`);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Increment failed login count
      const failedLogins = user.failedLogins + 1;
      const updateData: any = { failedLogins };

      // Lock account if too many failed attempts
      if (failedLogins >= MAX_FAILED_LOGINS) {
        updateData.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
        logger.security('Account locked due to failed logins', { email, failedLogins });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      throw new UnauthorizedError('Invalid email or password');
    }

    // Reset failed login count and update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLogins: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: clientIp,
      },
    });

    // Generate tokens
    const tokenPayload = { userId: user.id, email: user.email, role: user.role as UserRole };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token
    const refreshTokenExpiry = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS);
    await prisma.refreshToken.create({
      data: {
        token: hashRefreshToken(refreshToken),
        userId: user.id,
        expiresAt: refreshTokenExpiry,
      },
    });

    logger.info('User logged in', { userId: user.id, email: user.email, ip: clientIp });

    setRefreshTokenCookie(res, refreshToken);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        accessToken,
        refreshToken: config.isProduction ? undefined : refreshToken,
      },
    });
  })
);

/**
 * Refresh access token
 */
router.post(
  '/refresh',
  asyncHandler(async (req: Request, res: Response) => {
    // Get refresh token from cookie or body
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token required');
    }

    // Verify token signature
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Find token in database
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        token: {
          in: refreshTokenLookupCandidates(refreshToken),
        },
      },
      include: { user: true },
    });

    if (!storedToken) {
      // Token not found - possible token reuse attack
      logger.security('Refresh token not found - possible reuse', {
        userId: decoded.userId,
      });

      // Revoke all tokens for this user
      await prisma.refreshToken.updateMany({
        where: { userId: decoded.userId },
        data: { revokedAt: new Date() },
      });

      throw new UnauthorizedError('Invalid refresh token');
    }

    if (storedToken.revokedAt) {
      // Token was revoked - possible token reuse attack
      logger.security('Revoked refresh token used', {
        userId: decoded.userId,
        tokenId: storedToken.id,
      });

      // Revoke all tokens for this user
      await prisma.refreshToken.updateMany({
        where: { userId: decoded.userId },
        data: { revokedAt: new Date() },
      });

      throw new UnauthorizedError('Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token expired');
    }

    // Generate new tokens
    const user = storedToken.user;
    const tokenPayload = { userId: user.id, email: user.email, role: user.role as UserRole };
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    // Revoke old token and create new one (token rotation)
    const refreshTokenExpiry = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS);
    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: {
          revokedAt: new Date(),
          replacedBy: hashRefreshToken(newRefreshToken),
        },
      }),
      prisma.refreshToken.create({
        data: {
          token: hashRefreshToken(newRefreshToken),
          userId: user.id,
          expiresAt: refreshTokenExpiry,
        },
      }),
    ]);

    setRefreshTokenCookie(res, newRefreshToken);

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: config.isProduction ? undefined : newRefreshToken,
      },
    });
  })
);

/**
 * Logout user
 */
router.post(
  '/logout',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user.userId;
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    // Revoke refresh token if provided
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: {
          userId,
          token: {
            in: refreshTokenLookupCandidates(refreshToken),
          },
        },
        data: { revokedAt: new Date() },
      });
    }

    clearRefreshTokenCookie(res);

    logger.info('User logged out', { userId });

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  })
);

/**
 * Logout from all devices
 */
router.post(
  '/logout-all',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user.userId;

    // Revoke all refresh tokens for this user
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    clearRefreshTokenCookie(res);

    logger.info('User logged out from all devices', { userId });

    res.json({
      success: true,
      message: 'Logged out from all devices',
    });
  })
);

/**
 * Get current user
 */
router.get(
  '/me',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        country: true,
        emailVerified: true,
        twoFactorEnabled: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    res.json({
      success: true,
      data: { user },
    });
  })
);

/**
 * Update current user profile
 */
router.patch(
  '/me',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user.userId;
    const { name, phone, country } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (country !== undefined) updateData.country = country;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        country: true,
      },
    });

    logger.info('User profile updated', { userId });

    res.json({
      success: true,
      data: { user },
    });
  })
);

/**
 * Change password
 */
router.post(
  '/change-password',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new BadRequestError('Current password and new password are required');
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      throw new BadRequestError('New password must be at least 8 characters');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestError('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    // Update password and revoke all refresh tokens
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      }),
      prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    logger.info('User changed password', { userId });

    clearRefreshTokenCookie(res);

    res.json({
      success: true,
      message: 'Password changed successfully. Please login again.',
    });
  })
);

/**
 * Google OAuth - Initiate
 */
router.get('/google', (req: Request, res: Response) => {
  const frontendBaseUrl = getFrontendBaseUrl(req);
  if (!GOOGLE_CLIENT_ID) {
    return res.redirect(`${frontendBaseUrl}/oauth/callback?error=google_not_configured`);
  }

  const state = encodeOAuthState(frontendBaseUrl);
  const redirectUri = `${getBackendBaseUrl(req)}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'consent',
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

/**
 * Google OAuth - Callback
 */
router.get(
  '/google/callback',
  asyncHandler(async (req: Request, res: Response) => {
    const { code, error } = req.query;
    const frontendBaseUrl = getFrontendBaseUrlFromState(req.query.state, req);

    if (error || !code) {
      return res.redirect(`${frontendBaseUrl}/oauth/callback?error=google_auth_failed`);
    }

    try {
      const redirectUri = `${getBackendBaseUrl(req)}/api/auth/google/callback`;

      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code: code as string,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenResponse.json() as { access_token?: string };

      if (!tokenData.access_token) {
        throw new Error('Failed to get access token');
      }

      // Get user info
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      const userInfo = await userInfoResponse.json() as { email?: string; name?: string };

      if (!userInfo.email) {
        throw new Error('Failed to get user email');
      }

      // Find or create user
      let user = await prisma.user.findUnique({
        where: { email: userInfo.email.toLowerCase() },
      });

      if (!user) {
        // Create new user with OAuth
        const randomPassword = crypto.randomBytes(32).toString('hex');
        const hashedPassword = await bcrypt.hash(randomPassword, 12);

        user = await prisma.user.create({
          data: {
            email: userInfo.email.toLowerCase(),
            password: hashedPassword,
            name: userInfo.name || userInfo.email.split('@')[0],
            role: UserRole.USER,
            emailVerified: true, // OAuth emails are verified
          },
        });

        logger.info('User created via Google OAuth', { userId: user.id, email: user.email });
      }

      // Generate refresh token and persist a hashed value for rotation.
      const tokenPayload = { userId: user.id, email: user.email, role: user.role as UserRole };
      const refreshToken = generateRefreshToken(tokenPayload);

      const refreshTokenExpiry = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS);
      await prisma.refreshToken.create({
        data: {
          token: hashRefreshToken(refreshToken),
          userId: user.id,
          expiresAt: refreshTokenExpiry,
        },
      });

      setRefreshTokenCookie(res, refreshToken);

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          lastLoginIp: req.ip || req.socket.remoteAddress,
        },
      });

      logger.info('User logged in via Google', { userId: user.id, email: user.email });

      // Redirect without tokens in URL. Frontend exchanges refresh cookie for access token.
      const params = new URLSearchParams({
        oauth: 'success',
        role: user.role,
      });

      res.redirect(`${frontendBaseUrl}/oauth/callback?${params}`);
    } catch (err) {
      logger.error('Google OAuth error', { error: err });
      res.redirect(`${frontendBaseUrl}/oauth/callback?error=google_auth_failed`);
    }
  })
);

/**
 * Facebook OAuth - Initiate
 */
router.get('/facebook', (req: Request, res: Response) => {
  const frontendBaseUrl = getFrontendBaseUrl(req);
  if (!FACEBOOK_APP_ID) {
    return res.redirect(`${frontendBaseUrl}/oauth/callback?error=facebook_not_configured`);
  }

  const state = encodeOAuthState(frontendBaseUrl);
  const redirectUri = `${getBackendBaseUrl(req)}/api/auth/facebook/callback`;

  const params = new URLSearchParams({
    client_id: FACEBOOK_APP_ID,
    redirect_uri: redirectUri,
    scope: 'email,public_profile',
    state,
    response_type: 'code',
  });

  res.redirect(`https://www.facebook.com/v18.0/dialog/oauth?${params}`);
});

/**
 * Facebook OAuth - Callback
 */
router.get(
  '/facebook/callback',
  asyncHandler(async (req: Request, res: Response) => {
    const { code, error } = req.query;
    const frontendBaseUrl = getFrontendBaseUrlFromState(req.query.state, req);

    if (error || !code) {
      return res.redirect(`${frontendBaseUrl}/oauth/callback?error=facebook_auth_failed`);
    }

    try {
      const redirectUri = `${getBackendBaseUrl(req)}/api/auth/facebook/callback`;

      // Exchange code for tokens
      const tokenParams = new URLSearchParams({
        client_id: FACEBOOK_APP_ID,
        client_secret: FACEBOOK_APP_SECRET,
        redirect_uri: redirectUri,
        code: code as string,
      });

      const tokenResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?${tokenParams}`);
      const tokenData = await tokenResponse.json() as { access_token?: string };

      if (!tokenData.access_token) {
        throw new Error('Failed to get access token');
      }

      // Get user info
      const userInfoResponse = await fetch(
        `https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=${tokenData.access_token}`
      );
      const userInfo = await userInfoResponse.json() as { email?: string; name?: string; id?: string };

      if (!userInfo.email) {
        // Facebook doesn't always provide email
        return res.redirect(`${frontendBaseUrl}/oauth/callback?error=facebook_no_email`);
      }

      // Find or create user
      let user = await prisma.user.findUnique({
        where: { email: userInfo.email.toLowerCase() },
      });

      if (!user) {
        // Create new user with OAuth
        const randomPassword = crypto.randomBytes(32).toString('hex');
        const hashedPassword = await bcrypt.hash(randomPassword, 12);

        user = await prisma.user.create({
          data: {
            email: userInfo.email.toLowerCase(),
            password: hashedPassword,
            name: userInfo.name || userInfo.email.split('@')[0],
            role: UserRole.USER,
            emailVerified: true, // OAuth emails are verified
          },
        });

        logger.info('User created via Facebook OAuth', { userId: user.id, email: user.email });
      }

      // Generate refresh token and persist a hashed value for rotation.
      const tokenPayload = { userId: user.id, email: user.email, role: user.role as UserRole };
      const refreshToken = generateRefreshToken(tokenPayload);

      const refreshTokenExpiry = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS);
      await prisma.refreshToken.create({
        data: {
          token: hashRefreshToken(refreshToken),
          userId: user.id,
          expiresAt: refreshTokenExpiry,
        },
      });

      setRefreshTokenCookie(res, refreshToken);

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          lastLoginIp: req.ip || req.socket.remoteAddress,
        },
      });

      logger.info('User logged in via Facebook', { userId: user.id, email: user.email });

      // Redirect without tokens in URL. Frontend exchanges refresh cookie for access token.
      const params = new URLSearchParams({
        oauth: 'success',
        role: user.role,
      });

      res.redirect(`${frontendBaseUrl}/oauth/callback?${params}`);
    } catch (err) {
      logger.error('Facebook OAuth error', { error: err });
      res.redirect(`${frontendBaseUrl}/oauth/callback?error=facebook_auth_failed`);
    }
  })
);

export default router;
