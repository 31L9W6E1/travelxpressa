import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JWTPayload, UserRole, AuthenticatedRequest } from '../types';
import { UnauthorizedError, ForbiddenError } from './errorHandler';
import { logger } from '../utils/logger';
import { prisma } from '../lib/prisma';

/**
 * Authentication middleware - verifies JWT token
 */
export const authenticateToken = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(new UnauthorizedError('Access token required', 'TOKEN_MISSING'));
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      return next(new UnauthorizedError('User not found', 'USER_NOT_FOUND'));
    }

    // Attach user to request
    (req as AuthenticatedRequest).user = {
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new UnauthorizedError('Token expired', 'TOKEN_EXPIRED'));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      logger.security('Invalid JWT token', { ip: req.ip, error: error.message });
      return next(new UnauthorizedError('Invalid token', 'TOKEN_INVALID'));
    }
    next(error);
  }
};

/**
 * Optional authentication - attaches user if token is valid, but doesn't fail if missing
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true },
    });

    if (user) {
      (req as AuthenticatedRequest).user = {
        userId: user.id,
        email: user.email,
        role: user.role as UserRole,
      };
    }
  } catch {
    // Ignore errors for optional auth
  }

  next();
};

/**
 * Role-based access control middleware
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      return next(new UnauthorizedError('Authentication required', 'NOT_AUTHENTICATED'));
    }

    if (!roles.includes(user.role)) {
      logger.security('Unauthorized role access attempt', {
        userId: user.userId,
        role: user.role,
        requiredRoles: roles,
        path: req.path,
      });
      return next(new ForbiddenError('Insufficient permissions', 'INSUFFICIENT_ROLE'));
    }

    next();
  };
}

/**
 * Admin-only middleware
 */
export const isAdmin = requireRole(UserRole.ADMIN);

/**
 * Agent or Admin middleware
 */
export const isAgentOrAdmin = requireRole(UserRole.ADMIN, UserRole.AGENT);

/**
 * Generate access token
 */
export function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as string | number,
  } as jwt.SignOptions);
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as string | number,
  } as jwt.SignOptions);
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): JWTPayload {
  return jwt.verify(token, config.jwt.refreshSecret) as JWTPayload;
}

// Type augmentation for Express Request
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}
