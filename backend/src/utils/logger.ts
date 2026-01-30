import { config } from '../config';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = LOG_LEVELS[config.logging.level as LogLevel] || LOG_LEVELS.info;

function formatMessage(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= currentLevel;
}

export const logger = {
  debug(message: string, meta?: Record<string, unknown>): void {
    if (shouldLog('debug')) {
      console.debug(formatMessage('debug', message, meta));
    }
  },

  info(message: string, meta?: Record<string, unknown>): void {
    if (shouldLog('info')) {
      console.info(formatMessage('info', message, meta));
    }
  },

  warn(message: string, meta?: Record<string, unknown>): void {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', message, meta));
    }
  },

  error(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void {
    if (shouldLog('error')) {
      const errorMeta = error instanceof Error
        ? { error: error.message, stack: error.stack, ...meta }
        : { error: String(error), ...meta };
      console.error(formatMessage('error', message, errorMeta));
    }
  },

  // HTTP request logger
  http(req: { method: string; url: string; ip?: string }, statusCode: number, responseTime: number): void {
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
  security(event: string, details: Record<string, unknown>): void {
    console.warn(formatMessage('warn', `SECURITY: ${event}`, details));
  },

  // Audit logger
  audit(action: string, userId: string, details: Record<string, unknown>): void {
    console.info(formatMessage('info', `AUDIT: ${action}`, { userId, ...details }));
  },
};
