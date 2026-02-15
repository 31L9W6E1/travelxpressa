"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
const logger_1 = require("./utils/logger");
// Middleware
const security_1 = require("./middleware/security");
const rateLimit_1 = require("./middleware/rateLimit");
const errorHandler_1 = require("./middleware/errorHandler");
const validate_1 = require("./middleware/validate");
// Routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const inquiry_routes_1 = __importDefault(require("./routes/inquiry.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const application_routes_1 = __importDefault(require("./routes/application.routes"));
const posts_routes_1 = __importDefault(require("./routes/posts.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const flights_routes_1 = __importDefault(require("./routes/flights.routes"));
const site_routes_1 = __importDefault(require("./routes/site.routes"));
const app = (0, express_1.default)();
// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);
// Request ID for tracing
app.use(security_1.requestId);
// Security middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: config_1.config.isProduction ? undefined : false,
    crossOriginEmbedderPolicy: false,
}));
app.use(security_1.securityHeaders);
// CORS configuration
app.use((0, cors_1.default)({
    origin: config_1.config.corsOrigin.split(',').map(o => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-CSRF-Token'],
    exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    maxAge: 86400, // 24 hours
}));
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)(config_1.config.sessionSecret));
// Compression
app.use((0, compression_1.default)());
// Serve uploaded images statically
const uploadsRootDir = path_1.default.isAbsolute(config_1.config.upload.uploadDir)
    ? config_1.config.upload.uploadDir
    : path_1.default.join(process.cwd(), config_1.config.upload.uploadDir);
app.use('/uploads', express_1.default.static(uploadsRootDir, {
    maxAge: '7d',
    immutable: true,
    etag: true,
}));
// Security checks
app.use(security_1.preventParamPollution);
app.use(security_1.detectSuspiciousActivity);
app.use(validate_1.sanitizeBody);
// Request logging
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger_1.logger.http(req, res.statusCode, duration);
    });
    next();
});
// Health check endpoint (no rate limiting)
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: config_1.config.env,
    });
});
// Ready check endpoint (for Kubernetes)
app.get('/ready', async (_req, res) => {
    try {
        // Check database connection
        const { prisma } = await Promise.resolve().then(() => __importStar(require('./lib/prisma')));
        await prisma.$queryRaw `SELECT 1`;
        res.status(200).json({
            status: 'ready',
            database: 'connected',
        });
    }
    catch (error) {
        res.status(503).json({
            status: 'not ready',
            database: 'disconnected',
        });
    }
});
// API routes with rate limiting (disabled in development)
if (config_1.config.isProduction) {
    app.use('/api/auth', rateLimit_1.authRateLimit, security_1.csrfProtection, auth_routes_1.default);
    app.use('/api/site', site_routes_1.default);
    app.use('/api/applications', rateLimit_1.apiRateLimit, application_routes_1.default);
    app.use('/api/admin', rateLimit_1.apiRateLimit, admin_routes_1.default);
    app.use('/api/posts', rateLimit_1.apiRateLimit, posts_routes_1.default);
    app.use('/api/chat', rateLimit_1.chatRateLimit, chat_routes_1.default);
    app.use('/api/upload', rateLimit_1.apiRateLimit, upload_routes_1.default);
    app.use('/api/payments', rateLimit_1.apiRateLimit, payment_routes_1.default);
    app.use('/api/flights', flights_routes_1.default);
    // NOTE: Mount the generic /api routers last so they don't rate-limit every /api/* endpoint.
    app.use('/api', rateLimit_1.apiRateLimit, inquiry_routes_1.default);
    app.use('/api', rateLimit_1.apiRateLimit, user_routes_1.default);
}
else {
    // Development - no rate limiting
    app.use('/api/auth', security_1.csrfProtection, auth_routes_1.default);
    app.use('/api/site', site_routes_1.default);
    app.use('/api/admin', admin_routes_1.default);
    app.use('/api/applications', application_routes_1.default);
    app.use('/api/posts', posts_routes_1.default);
    app.use('/api/chat', chat_routes_1.default);
    app.use('/api/upload', upload_routes_1.default);
    app.use('/api/payments', payment_routes_1.default);
    app.use('/api/flights', flights_routes_1.default);
    app.use('/api', inquiry_routes_1.default);
    app.use('/api', user_routes_1.default);
}
// 404 handler
app.use(errorHandler_1.notFoundHandler);
// Global error handler
app.use(errorHandler_1.errorHandler);
// Graceful shutdown
const server = app.listen(config_1.config.port, () => {
    logger_1.logger.info(`Server started`, {
        port: config_1.config.port,
        environment: config_1.config.env,
        nodeVersion: process.version,
    });
});
// Handle graceful shutdown
process.on('SIGTERM', () => {
    logger_1.logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
        logger_1.logger.info('Server closed');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    logger_1.logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
        logger_1.logger.info('Server closed');
        process.exit(0);
    });
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger_1.logger.error('Unhandled Rejection', reason, { promise: String(promise) });
});
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger_1.logger.error('Uncaught Exception', error);
    process.exit(1);
});
exports.default = app;
//# sourceMappingURL=index.js.map