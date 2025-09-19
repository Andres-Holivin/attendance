import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

type UserRole = 'ADMIN' | 'STAFF';

/**
 * Creates a remote authentication middleware that validates sessions with the user service
 * @param userServiceUrl - The URL of the user service for session validation
 * @param requiredRole - Optional role requirement (ADMIN or STAFF). If not provided, any authenticated user can access
 * @returns Express middleware function
 * 
 * @example
 * // Authentication only (any logged-in user)
 * const requireAuth = createRemoteAuthMiddleware(env.USER_SERVICE_URL);
 * 
 * // Admin authorization required
 * const requireAdmin = createRemoteAuthMiddleware(env.USER_SERVICE_URL, 'ADMIN');
 * 
 * // Staff authorization required
 * const requireStaff = createRemoteAuthMiddleware(env.USER_SERVICE_URL, 'STAFF');
 */
export const createRemoteAuthMiddleware = (userServiceUrl: string, requiredRole?: UserRole) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Extract session cookie from request
            const sessionCookie = req.headers.cookie;

            console.log('Auth Middleware: Validating session with user service',
                { sessionCookie, requiredRole });
            if (!sessionCookie) {
                res.status(401).json({
                    success: false,
                    message: 'No session found',
                    error: 'UNAUTHORIZED'
                });
                return;
            }
            // Validate session with user service
            const response = await axios.get(`${userServiceUrl}/api/auth/validate`, {
                headers: {
                    cookie: sessionCookie,
                    "x-app-signature": req.appSource
                }
            });

            if (response.data.success && response.data.user) {
                // Attach user data to request
                req.user = response.data.user;
                req.sessionID = response.data.sessionData?.sessionId;

                // Check role authorization if required
                if (requiredRole) {
                    const userRole = response.data.user.role;
                    if (!userRole || userRole !== requiredRole) {
                        res.status(403).json({
                            success: false,
                            message: `Access denied. Required role: ${requiredRole}`,
                            error: 'FORBIDDEN'
                        });
                        return;
                    }
                }

                next();
            } else {
                res.status(401).json({
                    success: false,
                    message: 'Invalid session',
                    error: 'UNAUTHORIZED'
                });
            }
        } catch (error) {
            console.error('Auth validation error:', error);
            res.status(401).json({
                success: false,
                message: 'Authentication failed',
                error: 'UNAUTHORIZED'
            });
        }
    };
};