import { createRateLimiters, env } from '@workspace/utils';

const { limiter, authLimiter } = createRateLimiters(env.API_RATE_LIMIT, env.AUTH_RATE_LIMIT);

export { limiter, authLimiter };