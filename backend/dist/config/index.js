"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function requireEnv(name, defaultValue) {
    const value = process.env[name] || defaultValue;
    if (!value && process.env.NODE_ENV === 'production') {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value || '';
}
exports.config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    // Database
    databaseUrl: requireEnv('DATABASE_URL', 'file:./dev.db'),
    // JWT
    jwt: {
        secret: requireEnv('JWT_SECRET', 'dev-secret-change-in-production'),
        refreshSecret: requireEnv('JWT_REFRESH_SECRET', 'dev-refresh-secret-change-in-production'),
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },
    // Encryption
    encryptionKey: process.env.ENCRYPTION_KEY || '',
    // CORS
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    // Rate Limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
        authMaxRequests: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '50', 10),
    },
    // Session
    sessionSecret: process.env.SESSION_SECRET || 'dev-session-secret',
    // Redis
    redisUrl: process.env.REDIS_URL,
    // Email
    smtp: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        from: process.env.EMAIL_FROM || 'noreply@ds160helper.com',
    },
    // File Upload
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
        uploadDir: process.env.UPLOAD_DIR || './uploads',
    },
    // Logging
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.LOG_FORMAT || 'combined',
    },
    // Monitoring
    sentryDsn: process.env.SENTRY_DSN,
    // Feature Flags
    features: {
        enable2FA: process.env.ENABLE_2FA === 'true',
        enableAgentMode: process.env.ENABLE_AGENT_MODE === 'true',
    },
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
    isTest: process.env.NODE_ENV === 'test',
};
//# sourceMappingURL=index.js.map