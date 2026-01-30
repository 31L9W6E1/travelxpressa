"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitError = exports.ValidationError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.AppError = void 0;
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
exports.asyncHandler = asyncHandler;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
const config_1 = require("../config");
// Custom error classes
class AppError extends Error {
    constructor(message, statusCode, code) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class BadRequestError extends AppError {
    constructor(message = 'Bad request', code) {
        super(message, 400, code);
    }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized', code) {
        super(message, 401, code);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Forbidden', code) {
        super(message, 403, code);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends AppError {
    constructor(message = 'Resource not found', code) {
        super(message, 404, code);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message = 'Conflict', code) {
        super(message, 409, code);
    }
}
exports.ConflictError = ConflictError;
class ValidationError extends AppError {
    constructor(errors) {
        super('Validation failed', 400, 'VALIDATION_ERROR');
        this.errors = errors;
    }
}
exports.ValidationError = ValidationError;
class RateLimitError extends AppError {
    constructor(retryAfter) {
        super('Too many requests', 429, 'RATE_LIMIT_EXCEEDED');
        this.retryAfter = retryAfter;
    }
}
exports.RateLimitError = RateLimitError;
/**
 * Handle Prisma errors
 */
function handlePrismaError(error) {
    switch (error.code) {
        case 'P2002':
            // Unique constraint violation
            const field = error.meta?.target?.join(', ') || 'field';
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
            logger_1.logger.error('Unhandled Prisma error', error, { code: error.code });
            return new AppError('Database error', 500, 'DATABASE_ERROR');
    }
}
/**
 * Handle Zod validation errors
 */
function handleZodError(error) {
    const errors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
    }));
    return new ValidationError(errors);
}
/**
 * Global error handler middleware
 */
function errorHandler(err, req, res, _next) {
    // Log the error
    const requestId = req.headers['x-request-id'];
    // Handle known error types
    let appError;
    if (err instanceof AppError) {
        appError = err;
    }
    else if (err instanceof zod_1.ZodError) {
        appError = handleZodError(err);
    }
    else if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        appError = handlePrismaError(err);
    }
    else if (err instanceof client_1.Prisma.PrismaClientValidationError) {
        appError = new BadRequestError('Invalid data provided', 'PRISMA_VALIDATION');
    }
    else {
        // Unknown error
        logger_1.logger.error('Unhandled error', err, {
            requestId,
            path: req.path,
            method: req.method,
        });
        appError = new AppError(config_1.config.isProduction ? 'Internal server error' : err.message, 500, 'INTERNAL_ERROR');
    }
    // Log operational errors at warn level, programming errors at error level
    if (appError.isOperational) {
        logger_1.logger.warn(`${appError.message}`, {
            requestId,
            statusCode: appError.statusCode,
            code: appError.code,
            path: req.path,
        });
    }
    else {
        logger_1.logger.error('Non-operational error', err, {
            requestId,
            path: req.path,
        });
    }
    // Send response
    const response = {
        success: false,
        error: appError.message,
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
    if (!config_1.config.isProduction && err.stack) {
        response.stack = err.stack;
    }
    // Add request ID for tracking
    response.requestId = requestId;
    res.status(appError.statusCode).json(response);
}
/**
 * 404 handler for unmatched routes
 */
function notFoundHandler(req, _res, next) {
    next(new NotFoundError(`Route ${req.method} ${req.path} not found`));
}
/**
 * Async handler wrapper to catch errors in async route handlers
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
//# sourceMappingURL=errorHandler.js.map