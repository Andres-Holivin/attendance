// Re-export auth middleware from utils package
import { createRemoteAuthMiddleware, env } from '@workspace/utils';

// Create auth middleware that validates with user service
export const requireAuth = createRemoteAuthMiddleware(env.USER_SERVICE_URL);
