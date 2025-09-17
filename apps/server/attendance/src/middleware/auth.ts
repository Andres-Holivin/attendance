import { Response, NextFunction } from 'express';
import { env } from '@workspace/utils';

export const requireAuth = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get session ID from cookie
    const sessionId = req.headers.cookie?.split(';')
      .find((c: string) => c.trim().startsWith('sessionId='))
      ?.split('=')[1];

    if (!sessionId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required - no session found',
        error: 'UNAUTHORIZED'
      });
      return;
    }

    // Validate session with user service
    const userServiceUrl = env.USER_SERVICE_URL;

    try {
      const response = await fetch(`${userServiceUrl}/api/auth/validate`, {
        method: 'GET',
        headers: {
          'Cookie': `sessionId=${sessionId}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        res.status(401).json({
          success: false,
          message: 'Invalid or expired session',
          error: 'UNAUTHORIZED'
        });
        return;
      }

      const userData = await response.json();

      // Attach user data to request
      req.user = userData.user;
      next();
    } catch (error) {
      console.error('Error validating session with user service:', error);
      res.status(503).json({
        success: false,
        message: 'Authentication service unavailable',
        error: 'SERVICE_UNAVAILABLE'
      });
      return;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};
