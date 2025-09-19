
import express from 'express';
import passport from 'passport';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import { sessionOptions } from './lib/session';
import { configurePassport } from './config/passport';
import {
  createCorsOptions,
  createGracefulShutdown,
  createHealthRoute,
  createRateLimiters,
  createApiLoggingMiddleware,
  create404Handler,
  createErrorHandler,
  env,
  helmetOptions,
  getAppSource
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

app.use(getAppSource);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API logging middleware - add after body parsing but before routes
app.use(createApiLoggingMiddleware('user-service'));

// Session configuration
app.use(sessionOptions);

// Passport middleware
app.use(configurePassport);
app.use(passport.initialize());
app.use(passport.session());

// API routes
app.use('/health', createHealthRoute(prisma, env.NODE_ENV));
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', authLimiter, userRoutes);

// 404 handler
app.use('*', create404Handler());

// Global error handler
app.use(createErrorHandler('user-service', env.NODE_ENV === 'development'));

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