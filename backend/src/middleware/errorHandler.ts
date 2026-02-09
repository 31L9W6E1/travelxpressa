import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger';
import { config } from '../config';

// Custom error classes
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', code?: string) {
    super(message, 400, code);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', code?: string) {
    super(message, 401, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', code?: string) {
    super(message, 403, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', code?: string) {
    super(message, 404, code);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict', code?: string) {
    super(message, 409, code);
  }
}

export class ValidationError extends AppError {
  public readonly errors: Array<{ field: string; message: string }>;

  constructor(errors: Array<{ field: string; message: string }>) {
    super('Validation failed', 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

export class RateLimitError extends AppError {
  public readonly retryAfter: number;

  constructor(retryAfter: number) {
    super('Too many requests', 429, 'RATE_LIMIT_EXCEEDED');
    this.retryAfter = retryAfter;
  }
}

/**
 * Handle Prisma errors
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): AppError {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const field = (error.meta?.target as string[])?.join(', ') || 'field';
      return new ConflictError(`A record with this ${field} already exists`, 'DUPLICATE_ENTRY');

    case 'P2025':
      // Record not found
      return new NotFoundError('Record not found', 'RECORD_NOT_FOUND');

    case 'P2003':
      // Foreign key constraint failure
      return new BadRequestError('Invalid reference', 'INVALID_REFERENCE');

    case 'P2014':
      // Required relation violation
      return new BadRequestError('Required relation missing', 'RELATION_REQUIRED');

    default:
      logger.error('Unhandled Prisma error', error, { code: error.code });
      return new AppError('Database error', 500, 'DATABASE_ERROR');
  }
}

/**
 * Handle Zod validation errors
 */
function handleZodError(error: ZodError): ValidationError {
  const errors = error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
  return new ValidationError(errors);
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log the error
  const requestId = req.headers['x-request-id'] as string;

  // Handle known error types
  let appError: AppError;

  if (err instanceof AppError) {
    appError = err;
  } else if (err instanceof ZodError) {
    appError = handleZodError(err);
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    appError = handlePrismaError(err);
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    appError = new BadRequestError('Invalid data provided', 'PRISMA_VALIDATION');
  } else {
    // Unknown error
    logger.error('Unhandled error', err, {
      requestId,
      path: req.path,
      method: req.method,
    });

    appError = new AppError(
      config.isProduction ? 'Internal server error' : err.message,
      500,
      'INTERNAL_ERROR'
    );
  }

  // Log operational errors at warn level, programming errors at error level
  if (appError.isOperational) {
    logger.warn(`${appError.message}`, {
      requestId,
      statusCode: appError.statusCode,
      code: appError.code,
      path: req.path,
    });
  } else {
    logger.error('Non-operational error', err, {
      requestId,
      path: req.path,
    });
  }

  // Send response
  const response: Record<string, unknown> = {
    success: false,
    error: appError.message,
    message: appError.message,
    code: appError.code,
  };

  // Add validation errors if present
  if (appError instanceof ValidationError) {
    response.errors = appError.errors;
  }

  // Add retry-after for rate limit errors
  if (appError instanceof RateLimitError) {
    res.set('Retry-After', String(appError.retryAfter));
    response.retryAfter = appError.retryAfter;
  }

  // Add stack trace in development
  if (!config.isProduction && err.stack) {
    response.stack = err.stack;
  }

  // Add request ID for tracking
  response.requestId = requestId;

  res.status(appError.statusCode).json(response);
}

/**
 * 404 handler for unmatched routes
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new NotFoundError(`Route ${req.method} ${req.path} not found`));
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export function asyncHandler<T>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
