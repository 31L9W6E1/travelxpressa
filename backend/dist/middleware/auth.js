"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAgentOrAdmin = exports.isAdmin = exports.optionalAuth = exports.authenticateToken = void 0;
exports.requireRole = requireRole;
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.verifyRefreshToken = verifyRefreshToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const types_1 = require("../types");
const errorHandler_1 = require("./errorHandler");
const logger_1 = require("../utils/logger");
const prisma_1 = require("../lib/prisma");
/**
 * Authentication middleware - verifies JWT token
 */
const authenticateToken = async (req, _res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return next(new errorHandler_1.UnauthorizedError('Access token required', 'TOKEN_MISSING'));
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
        // Verify user still exists and is active
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, role: true },
        });
        if (!user) {
            return next(new errorHandler_1.UnauthorizedError('User not found', 'USER_NOT_FOUND'));
        }
        // Attach user to request
        req.user = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return next(new errorHandler_1.UnauthorizedError('Token expired', 'TOKEN_EXPIRED'));
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            logger_1.logger.security('Invalid JWT token', { ip: req.ip, error: error.message });
            return next(new errorHandler_1.UnauthorizedError('Invalid token', 'TOKEN_INVALID'));
        }
        next(error);
    }
};
exports.authenticateToken = authenticateToken;
/**
 * Optional authentication - attaches user if token is valid, but doesn't fail if missing
 */
const optionalAuth = async (req, _res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return next();
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, role: true },
        });
        if (user) {
            req.user = {
                userId: user.id,
                email: user.email,
                role: user.role,
            };
        }
    }
    catch {
        // Ignore errors for optional auth
    }
    next();
};
exports.optionalAuth = optionalAuth;
/**
 * Role-based access control middleware
 */
function requireRole(...roles) {
    return (req, _res, next) => {
        const user = req.user;
        if (!user) {
            return next(new errorHandler_1.UnauthorizedError('Authentication required', 'NOT_AUTHENTICATED'));
        }
        if (!roles.includes(user.role)) {
            logger_1.logger.security('Unauthorized role access attempt', {
                userId: user.userId,
                role: user.role,
                requiredRoles: roles,
                path: req.path,
            });
            return next(new errorHandler_1.ForbiddenError('Insufficient permissions', 'INSUFFICIENT_ROLE'));
        }
        next();
    };
}
/**
 * Admin-only middleware
 */
exports.isAdmin = requireRole(types_1.UserRole.ADMIN);
/**
 * Agent or Admin middleware
 */
exports.isAgentOrAdmin = requireRole(types_1.UserRole.ADMIN, types_1.UserRole.AGENT);
/**
 * Generate access token
 */
function generateAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, config_1.config.jwt.secret, {
        expiresIn: config_1.config.jwt.expiresIn,
    });
}
/**
 * Generate refresh token
 */
function generateRefreshToken(payload) {
    return jsonwebtoken_1.default.sign(payload, config_1.config.jwt.refreshSecret, {
        expiresIn: config_1.config.jwt.refreshExpiresIn,
    });
}
/**
 * Verify refresh token
 */
function verifyRefreshToken(token) {
    return jsonwebtoken_1.default.verify(token, config_1.config.jwt.refreshSecret);
}
//# sourceMappingURL=auth.js.map