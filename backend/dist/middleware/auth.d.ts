import { Request, Response, NextFunction } from 'express';
import { JWTPayload, UserRole } from '../types';
/**
 * Authentication middleware - verifies JWT token
 */
export declare const authenticateToken: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
/**
 * Optional authentication - attaches user if token is valid, but doesn't fail if missing
 */
export declare const optionalAuth: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
/**
 * Role-based access control middleware
 */
export declare function requireRole(...roles: UserRole[]): (req: Request, _res: Response, next: NextFunction) => void;
/**
 * Admin-only middleware
 */
export declare const isAdmin: (req: Request, _res: Response, next: NextFunction) => void;
/**
 * Agent or Admin middleware
 */
export declare const isAgentOrAdmin: (req: Request, _res: Response, next: NextFunction) => void;
/**
 * Generate access token
 */
export declare function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string;
/**
 * Generate refresh token
 */
export declare function generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string;
/**
 * Verify refresh token
 */
export declare function verifyRefreshToken(token: string): JWTPayload;
declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
    }
}
//# sourceMappingURL=auth.d.ts.map