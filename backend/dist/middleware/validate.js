"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
exports.sanitizeInput = sanitizeInput;
exports.deepSanitize = deepSanitize;
exports.sanitizeBody = sanitizeBody;
const zod_1 = require("zod");
const logger_1 = require("../utils/logger");
/**
 * Validation middleware factory
 * Validates request body, query params, and/or URL params against Zod schemas
 */
function validate(schemas) {
    return async (req, res, next) => {
        try {
            if (schemas.body) {
                req.body = await schemas.body.parseAsync(req.body);
            }
            if (schemas.query) {
                req.query = await schemas.query.parseAsync(req.query);
            }
            if (schemas.params) {
                req.params = await schemas.params.parseAsync(req.params);
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errors = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                logger_1.logger.warn('Validation failed', { errors, path: req.path });
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    errors,
                });
            }
            logger_1.logger.error('Unexpected validation error', error);
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
function sanitizeInput(input) {
    return input
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .trim();
}
/**
 * Deep sanitize an object's string values
 */
function deepSanitize(obj) {
    if (typeof obj === 'string') {
        return sanitizeInput(obj);
    }
    if (Array.isArray(obj)) {
        return obj.map((item) => deepSanitize(item));
    }
    if (obj && typeof obj === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            sanitized[key] = deepSanitize(value);
        }
        return sanitized;
    }
    return obj;
}
/**
 * Middleware to sanitize request body
 */
function sanitizeBody(req, _res, next) {
    if (req.body && typeof req.body === 'object') {
        req.body = deepSanitize(req.body);
    }
    next();
}
//# sourceMappingURL=validate.js.map