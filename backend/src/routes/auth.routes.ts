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
import { generateToken } from '../utils/encryption';

const router = Router();

// OAuth Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || '';
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || '';
const OAUTH_REDIRECT_BASE = process.env.FRONTEND_URL || 'http://localhost:5173';

const BCRYPT_ROUNDS = 12;
const MAX_FAILED_LOGINS = 100; // Increased for development
const LOCKOUT_DURATION_MS = 1 * 60 * 1000; // 1 minute in development

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
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: refreshTokenExpiry,
      },
    });

    logger.info('User registered', { userId: user.id, email: user.email });

    // Set refresh token as httpOnly cookie in production
    if (config.isProduction) {
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }

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
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: refreshTokenExpiry,
      },
    });

    logger.info('User logged in', { userId: user.id, email: user.email, ip: clientIp });

    // Set refresh token as httpOnly cookie in production
    if (config.isProduction) {
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

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
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
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
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: {
          revokedAt: new Date(),
          replacedBy: newRefreshToken,
        },
      }),
      prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: user.id,
          expiresAt: refreshTokenExpiry,
        },
      }),
    ]);

    // Set new refresh token as httpOnly cookie in production
    if (config.isProduction) {
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

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
        where: { token: refreshToken, userId },
        data: { revokedAt: new Date() },
      });
    }

    // Clear cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: 'strict',
    });

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

    // Clear cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: 'strict',
    });

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

    // Clear cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: 'strict',
    });

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
  if (!GOOGLE_CLIENT_ID) {
    return res.redirect(`${OAUTH_REDIRECT_BASE}/login?error=google_not_configured`);
  }

  const state = crypto.randomBytes(32).toString('hex');
  const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;

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

    if (error || !code) {
      return res.redirect(`${OAUTH_REDIRECT_BASE}/login?error=google_auth_failed`);
    }

    try {
      const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;

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

      // Generate tokens
      const tokenPayload = { userId: user.id, email: user.email, role: user.role as UserRole };
      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      // Store refresh token
      const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: refreshTokenExpiry,
        },
      });

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          lastLoginIp: req.ip || req.socket.remoteAddress,
        },
      });

      logger.info('User logged in via Google', { userId: user.id, email: user.email });

      // Redirect to frontend with tokens
      const params = new URLSearchParams({
        accessToken,
        refreshToken,
        userId: user.id,
        email: user.email,
        name: user.name || '',
        role: user.role,
      });

      res.redirect(`${OAUTH_REDIRECT_BASE}/oauth/callback?${params}`);
    } catch (err) {
      logger.error('Google OAuth error', { error: err });
      res.redirect(`${OAUTH_REDIRECT_BASE}/login?error=google_auth_failed`);
    }
  })
);

/**
 * Facebook OAuth - Initiate
 */
router.get('/facebook', (req: Request, res: Response) => {
  if (!FACEBOOK_APP_ID) {
    return res.redirect(`${OAUTH_REDIRECT_BASE}/login?error=facebook_not_configured`);
  }

  const state = crypto.randomBytes(32).toString('hex');
  const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/facebook/callback`;

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

    if (error || !code) {
      return res.redirect(`${OAUTH_REDIRECT_BASE}/login?error=facebook_auth_failed`);
    }

    try {
      const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/facebook/callback`;

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
        return res.redirect(`${OAUTH_REDIRECT_BASE}/login?error=facebook_no_email`);
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

      // Generate tokens
      const tokenPayload = { userId: user.id, email: user.email, role: user.role as UserRole };
      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      // Store refresh token
      const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: refreshTokenExpiry,
        },
      });

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          lastLoginIp: req.ip || req.socket.remoteAddress,
        },
      });

      logger.info('User logged in via Facebook', { userId: user.id, email: user.email });

      // Redirect to frontend with tokens
      const params = new URLSearchParams({
        accessToken,
        refreshToken,
        userId: user.id,
        email: user.email,
        name: user.name || '',
        role: user.role,
      });

      res.redirect(`${OAUTH_REDIRECT_BASE}/oauth/callback?${params}`);
    } catch (err) {
      logger.error('Facebook OAuth error', { error: err });
      res.redirect(`${OAUTH_REDIRECT_BASE}/login?error=facebook_auth_failed`);
    }
  })
);

export default router;
