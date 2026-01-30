import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
interface ValidationOptions {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
}
/**
 * Validation middleware factory
 * Validates request body, query params, and/or URL params against Zod schemas
 */
export declare function validate(schemas: ValidationOptions): (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Sanitizes string input to prevent XSS attacks
 */
export declare function sanitizeInput(input: string): string;
/**
 * Deep sanitize an object's string values
 */
export declare function deepSanitize<T>(obj: T): T;
/**
 * Middleware to sanitize request body
 */
export declare function sanitizeBody(req: Request, _res: Response, next: NextFunction): void;
export {};
//# sourceMappingURL=validate.d.ts.map