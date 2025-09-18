import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

// Common auth middleware for services that need to validate user sessions
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
    if (req.isAuthenticated?.()) {
        return next();
    }

    res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'UNAUTHORIZED'
    });
};

// Auth middleware for services that need to validate session with user service
export const createRemoteAuthMiddleware = (userServiceUrl: string) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Extract session cookie from request
            const sessionCookie = req.headers.cookie;

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
                    cookie: sessionCookie
                }
            });

            if (response.data.success && response.data.user) {
                // Attach user data to request
                (req as any).user = response.data.user;
                (req as any).sessionID = response.data.sessionData?.sessionId;
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