import { Request, Response, NextFunction } from 'express';
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
export declare function rateLimit(options?: RateLimitOptions): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * Strict rate limit for authentication endpoints
 */
export declare const authRateLimit: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * General API rate limit
 */
export declare const apiRateLimit: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export {};
//# sourceMappingURL=rateLimit.d.ts.map