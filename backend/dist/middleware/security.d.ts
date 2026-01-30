import { Request, Response, NextFunction } from 'express';
/**
 * Security headers middleware
 */
export declare function securityHeaders(_req: Request, res: Response, next: NextFunction): void;
/**
 * Generate CSRF token
 */
export declare function generateCSRFToken(sessionId: string): string;
/**
 * Verify CSRF token
 */
export declare function verifyCSRFToken(sessionId: string, token: string): boolean;
/**
 * CSRF protection middleware
 */
export declare function csrfProtection(req: Request, res: Response, next: NextFunction): void;
/**
 * Request ID middleware for tracing
 */
export declare function requestId(req: Request, res: Response, next: NextFunction): void;
/**
 * Prevent parameter pollution
 */
export declare function preventParamPollution(req: Request, _res: Response, next: NextFunction): void;
/**
 * Audit logging middleware
 */
export declare function auditLog(action: string): (req: Request, _res: Response, next: NextFunction) => void;
/**
 * Suspicious activity detector
 */
export declare function detectSuspiciousActivity(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=security.d.ts.map