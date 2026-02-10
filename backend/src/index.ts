import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'path';
import { config } from './config';
import { logger } from './utils/logger';

// Middleware
import { securityHeaders, requestId, preventParamPollution, detectSuspiciousActivity } from './middleware/security';
import { apiRateLimit, authRateLimit } from './middleware/rateLimit';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { sanitizeBody } from './middleware/validate';

// Routes
import authRoutes from './routes/auth.routes';
import inquiryRoutes from './routes/inquiry.routes';
import adminRoutes from './routes/admin.routes';
import userRoutes from './routes/user.routes';
import applicationRoutes from './routes/application.routes';
import postsRoutes from './routes/posts.routes';
import chatRoutes from './routes/chat.routes';
import uploadRoutes from './routes/upload.routes';
import paymentRoutes from './routes/payment.routes';

const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Request ID for tracing
app.use(requestId);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: config.isProduction ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));
app.use(securityHeaders);

// CORS configuration
app.use(cors({
  origin: config.corsOrigin.split(',').map(o => o.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-CSRF-Token'],
  exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  maxAge: 86400, // 24 hours
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(config.sessionSecret));

// Compression
app.use(compression());

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Security checks
app.use(preventParamPollution);
app.use(detectSuspiciousActivity);
app.use(sanitizeBody);

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(req, res.statusCode, duration);
  });
  next();
});

// Health check endpoint (no rate limiting)
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: config.env,
  });
});

// Ready check endpoint (for Kubernetes)
app.get('/ready', async (_req, res) => {
  try {
    // Check database connection
    const { prisma } = await import('./lib/prisma');
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: 'ready',
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      database: 'disconnected',
    });
  }
});

// API routes with rate limiting (disabled in development)
if (config.isProduction) {
  app.use('/api/auth', authRateLimit, authRoutes);
  app.use('/api', apiRateLimit, inquiryRoutes);
  app.use('/api/admin', apiRateLimit, adminRoutes);
  app.use('/api', apiRateLimit, userRoutes);
  app.use('/api/applications', apiRateLimit, applicationRoutes);
  app.use('/api/posts', apiRateLimit, postsRoutes);
  app.use('/api/chat', apiRateLimit, chatRoutes);
  app.use('/api/upload', apiRateLimit, uploadRoutes);
  app.use('/api/payments', apiRateLimit, paymentRoutes);
} else {
  // Development - no rate limiting
  app.use('/api/auth', authRoutes);
  app.use('/api', inquiryRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api', userRoutes);
  app.use('/api/applications', applicationRoutes);
  app.use('/api/posts', postsRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/payments', paymentRoutes);
}

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Graceful shutdown
const server = app.listen(config.port, () => {
  logger.info(`Server started`, {
    port: config.port,
    environment: config.env,
    nodeVersion: process.version,
  });
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', reason as Error, { promise: String(promise) });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', error);
  process.exit(1);
});

export default app;
