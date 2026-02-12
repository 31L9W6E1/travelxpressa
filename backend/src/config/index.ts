import dotenv from 'dotenv';

// Only load .env file in development - in production, use environment variables directly
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

function requireEnv(
  name: string,
  defaultValue?: string,
  options?: { allowDefaultInProduction?: boolean }
): string {
  const rawValue = process.env[name]?.trim();
  const isProduction = process.env.NODE_ENV === 'production';
  const allowDefaultInProduction = options?.allowDefaultInProduction ?? true;

  if (rawValue) {
    if (
      isProduction &&
      !allowDefaultInProduction &&
      defaultValue !== undefined &&
      rawValue === defaultValue
    ) {
      throw new Error(`Insecure default value detected for environment variable: ${name}`);
    }
    return rawValue;
  }

  if (defaultValue !== undefined) {
    if (isProduction && !allowDefaultInProduction) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
    return defaultValue;
  }

  if (isProduction) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return '';
}

function parseOptionalInt(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),

  // Database
  databaseUrl: requireEnv(
    'DATABASE_URL',
    'postgresql://ds160user:ds160pass@localhost:5432/ds160_db?schema=public'
  ),

  // JWT
  jwt: {
    secret: requireEnv('JWT_SECRET', 'dev-secret-change-in-production', {
      allowDefaultInProduction: false,
    }),
    refreshSecret: requireEnv('JWT_REFRESH_SECRET', 'dev-refresh-secret-change-in-production', {
      allowDefaultInProduction: false,
    }),
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
    authMaxRequests: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '200', 10), // Increased from 50 to 200
  },

  // Session
  sessionSecret: requireEnv('SESSION_SECRET', 'dev-session-secret', {
    allowDefaultInProduction: false,
  }),

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

  // Frontend URL
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Kiwi Tequila Flight API
  kiwiApiKey: process.env.KIWI_API_KEY || '',

  // CMS auto-translation
  cmsAutoTranslate: {
    enabled: !['0', 'false', 'no', 'off'].includes((process.env.CMS_AUTO_TRANSLATE_ENABLED || 'true').trim().toLowerCase()),
    locales: process.env.CMS_AUTO_TRANSLATE_LOCALES || 'mn',
    openAiApiKey: process.env.OPENAI_API_KEY || '',
    openAiModel: process.env.OPENAI_TRANSLATION_MODEL || 'gpt-4.1-mini',
  },

  // Telegram Notifications
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    chatId: process.env.TELEGRAM_CHAT_ID || '',
    messageThreadId: parseOptionalInt(process.env.TELEGRAM_MESSAGE_THREAD_ID),
  },

  // Feature Flags
  features: {
    enable2FA: process.env.ENABLE_2FA === 'true',
    enableAgentMode: process.env.ENABLE_AGENT_MODE === 'true',
  },

  // QPay Payment Gateway
  qpay: {
    baseUrl: process.env.QPAY_BASE_URL || 'https://merchant.qpay.mn/v2',
    sandboxUrl: 'https://merchant-sandbox.qpay.mn/v2',
    username: process.env.QPAY_USERNAME || '',
    password: process.env.QPAY_PASSWORD || '',
    invoiceCode: process.env.QPAY_INVOICE_CODE || '',
    callbackUrl: process.env.QPAY_CALLBACK_URL || '',
    useSandbox: process.env.QPAY_USE_SANDBOX === 'true',
  },

  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',
};
