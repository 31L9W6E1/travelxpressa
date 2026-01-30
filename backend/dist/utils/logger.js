"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const config_1 = require("../config");
const LOG_LEVELS = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};
const currentLevel = LOG_LEVELS[config_1.config.logging.level] || LOG_LEVELS.info;
function formatMessage(level, message, meta) {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}
function shouldLog(level) {
    return LOG_LEVELS[level] >= currentLevel;
}
exports.logger = {
    debug(message, meta) {
        if (shouldLog('debug')) {
            console.debug(formatMessage('debug', message, meta));
        }
    },
    info(message, meta) {
        if (shouldLog('info')) {
            console.info(formatMessage('info', message, meta));
        }
    },
    warn(message, meta) {
        if (shouldLog('warn')) {
            console.warn(formatMessage('warn', message, meta));
        }
    },
    error(message, error, meta) {
        if (shouldLog('error')) {
            const errorMeta = error instanceof Error
                ? { error: error.message, stack: error.stack, ...meta }
                : { error: String(error), ...meta };
            console.error(formatMessage('error', message, errorMeta));
        }
    },
    // HTTP request logger
    http(req, statusCode, responseTime) {
        if (shouldLog('info')) {
            console.info(formatMessage('info', 'HTTP Request', {
                method: req.method,
                url: req.url,
                ip: req.ip,
                statusCode,
                responseTime: `${responseTime}ms`,
            }));
        }
    },
    // Security event logger
    security(event, details) {
        console.warn(formatMessage('warn', `SECURITY: ${event}`, details));
    },
    // Audit logger
    audit(action, userId, details) {
        console.info(formatMessage('info', `AUDIT: ${action}`, { userId, ...details }));
    },
};
//# sourceMappingURL=logger.js.map