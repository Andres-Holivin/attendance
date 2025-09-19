import { createRemoteAuthMiddleware, env } from '@workspace/utils';

// Regular authentication middleware (no role requirement)
export const requireAuth = createRemoteAuthMiddleware(env.USER_SERVICE_URL);

// Admin-only authentication middleware
export const requireAdmin = createRemoteAuthMiddleware(env.USER_SERVICE_URL, 'ADMIN');

// Staff-only authentication middleware (example for other services)
export const requireStaff = createRemoteAuthMiddleware(env.USER_SERVICE_URL, 'STAFF');
