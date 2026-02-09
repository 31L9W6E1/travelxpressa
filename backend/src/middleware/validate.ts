import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { logger } from '../utils/logger';

interface ValidationOptions {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Validation middleware factory
 * Validates request body, query params, and/or URL params against Zod schemas
 */
export function validate(schemas: ValidationOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        // Note: req.query is read-only in Express 5+, so we just validate without reassigning
        // The parsed/transformed values are stored on req for use in handlers
        const parsedQuery = await schemas.query.parseAsync(req.query);
        // Store parsed query on request for handlers to use
        (req as any).validatedQuery = parsedQuery;
        // Copy parsed values back to query object properties (without replacing the object)
        Object.keys(parsedQuery).forEach(key => {
          (req.query as any)[key] = parsedQuery[key];
        });
      }
      if (schemas.params) {
        // Same approach for params
        const parsedParams = await schemas.params.parseAsync(req.params);
        Object.keys(parsedParams).forEach(key => {
          (req.params as any)[key] = parsedParams[key];
        });
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        logger.warn('Validation failed', { errors, path: req.path });

        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          errors,
        });
      }

      logger.error('Unexpected validation error', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };
}

/**
 * Sanitizes string input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Deep sanitize an object's string values
 */
export function deepSanitize<T>(obj: T): T {
  if (typeof obj === 'string') {
    return sanitizeInput(obj) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepSanitize(item)) as T;
  }

  if (obj && typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = deepSanitize(value);
    }
    return sanitized as T;
  }

  return obj;
}

/**
 * Middleware to sanitize request body
 */
export function sanitizeBody(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    req.body = deepSanitize(req.body);
  }
  next();
}
