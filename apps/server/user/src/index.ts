
import express from 'express';
import passport from 'passport';

// Import routes
import authRoutes from './routes/auth';
import { sessionOptions } from './lib/session';
import { configurePassport } from './config/passport';
import {
  createCorsOptions,
  createGracefulShutdown,
  createHealthRoute,
  createRateLimiters,
  env,
  helmetOptions
} from '@workspace/utils';
import { prisma } from './config/database';

const app = express();
const PORT = env.PORT

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware
app.use(helmetOptions);

const { limiter, authLimiter } = createRateLimiters(env.API_RATE_LIMIT, env.AUTH_RATE_LIMIT);

app.use(limiter);
app.use(createCorsOptions(env.ALLOWED_ORIGINS))

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
app.use(sessionOptions);

// Passport middleware
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint


// API routes
app.use('/health', createHealthRoute(prisma, env.NODE_ENV));
app.use('/api/auth', authLimiter, authRoutes);

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
  console.log(`🚀 User service running on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoints available at http://localhost:${PORT}/api/auth`);
  console.log(`👥 User endpoints available at http://localhost:${PORT}/api/users`);
  console.log(`🌍 Environment: ${env.NODE_ENV || 'development'}`);
});

export default app;