
import express from 'express';

import {
  createCorsOptions,
  createGracefulShutdown,
  createHealthRoute,
  createRateLimiters,
  create404Handler,
  createErrorHandler,
  env,
  helmetOptions,
  createApiLoggingMiddleware,
  getAppSource
} from '@workspace/utils';
import { prisma } from './config/database';
import { PubsubService, PubSubSubscriptions } from './service/pub-sub.service';
import { ApiLogService } from './service/api-log.service';
import apiLogRoutes from './routes/api-log';

const app = express();
const PORT = env.PORT

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware

const { limiter } = createRateLimiters(env.API_RATE_LIMIT, env.AUTH_RATE_LIMIT);

app.use(helmetOptions);
app.use(createCorsOptions(env.ALLOWED_ORIGINS))
app.use(limiter);

app.use(getAppSource);
// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(createApiLoggingMiddleware('logging-service'));

// Health check endpoint
app.use('/health', createHealthRoute(prisma, env.NODE_ENV));

// API routes
app.use('/api/logs', apiLogRoutes);

// Set up pub/sub subscription for API logs
PubsubService.subscribe(PubSubSubscriptions.API_LOG_SUBSCRIPTION, ApiLogService.createLog);
console.log('📡 Subscribed to API log events via Pub/Sub');

// 404 handler
app.use('*', create404Handler());

// Global error handler
app.use(createErrorHandler('logging-service', env.NODE_ENV === 'development'));

// Graceful shutdown

process.on('SIGTERM', createGracefulShutdown(prisma));
process.on('SIGINT', createGracefulShutdown(prisma));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Logging service running on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  console.log(`� API logs available at http://localhost:${PORT}/api/logs`);
  console.log(`🌍 Environment: ${env.NODE_ENV || 'development'}`);
});

export default app;