const rateLimit = require('express-rate-limit');

export const createRateLimiters = (apiRateLimit: number, authRateLimit: number) => {
    // Rate limiting
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: apiRateLimit,
        message: {
            success: false,
            message: 'Too many requests from this IP, please try again later',
            error: 'RATE_LIMIT_EXCEEDED',
        },
        standardHeaders: true,
        legacyHeaders: false,
    });

    // Auth rate limiting (more restrictive)
    const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: authRateLimit,
        message: {
            success: false,
            message: 'Too many authentication attempts, please try again later',
            error: 'AUTH_RATE_LIMIT_EXCEEDED',
        },
        standardHeaders: true,
        legacyHeaders: false,
    });

    return { limiter, authLimiter };
};