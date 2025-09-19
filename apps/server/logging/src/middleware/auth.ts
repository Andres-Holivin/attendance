// Re-export auth middleware from utils package
import { createRemoteAuthMiddleware, env } from '@workspace/utils';

// Regular authentication middleware (no role requirement)
export const requireAuth = createRemoteAuthMiddleware(env.USER_SERVICE_URL);

// Admin-only authentication middleware
export const requireAdmin = createRemoteAuthMiddleware(env.USER_SERVICE_URL, 'ADMIN');
