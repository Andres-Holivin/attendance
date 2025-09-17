
import express from 'express';
import {
  createCorsOptions,
  helmetOptions,
  createRateLimiters,
  createGracefulShutdown,
  env,
  createHealthRoute
} from '@workspace/utils';

// Import routes
import attendanceRoutes from './routes/attendance';
import { PubsubService, PubSubSubscriptions } from './service/pub-sub.service';
import { UserService } from './service/user.service';
import { prisma } from './config/database';

// Load environment variables
const app = express();
const PORT = env.PORT;
console.log("Port:", PORT);

// Create middleware instances
const { limiter } = createRateLimiters(env.API_RATE_LIMIT, env.AUTH_RATE_LIMIT);

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware
app.use(helmetOptions);
app.use(createCorsOptions(env.ALLOWED_ORIGINS));
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
app.use('/health', createHealthRoute(prisma, env.NODE_ENV));
app.use('/api/attendance', attendanceRoutes);

// Subscription to Pub/Sub can be added here for attendance-related events
PubsubService.subscribe(PubSubSubscriptions.USER_SERVICE_SUBSCRIPTION, UserService.upsertUser);


// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    error: 'NOT_FOUND',
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);

  // Don't send response if headers already sent
  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: err.code || 'INTERNAL_SERVER_ERROR',
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Graceful shutdown
process.on('SIGTERM', createGracefulShutdown(prisma));
process.on('SIGINT', createGracefulShutdown(prisma));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Attendance service running on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  console.log(`� Attendance endpoints available at http://localhost:${PORT}/api/attendance`);
  console.log(`🌍 Environment: ${env.NODE_ENV || 'development'}`);
});

export default app;