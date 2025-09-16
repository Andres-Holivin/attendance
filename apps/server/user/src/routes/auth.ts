import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { prisma } from '../config/database';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { SignUpSchema, SignInSchema } from '@workspace/validation/auth';
import { UpdateProfileSchema } from '@workspace/validation/user';
import { AuthService } from '@/service/auth.service';

// Extend session data interface for database session storage
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    loginTime?: string;
    userAgent?: string;
    visitCount?: number;
  }
}

const router = Router();

/**
 * POST /register
 * Register a new user
 */
router.post('/register', validate({ body: SignUpSchema }), AuthService.signUp);

/**
 * POST /login
 * Authenticate user and create session
 */
router.post('/login', validate({ body: SignInSchema }), (req: Request, res: Response, next: NextFunction): void => {
  passport.authenticate('local', (err: any, user: any, info: any) => {
    if (err) {
      console.error('💥 Authentication error:', err);
      return res.status(500).json({
        success: false,
        message: 'Authentication error',
        error: 'INTERNAL_SERVER_ERROR',
      });
    }

    if (!user) {
      console.log('🚫 User not found or invalid credentials');
      return res.status(401).json({
        success: false,
        message: info?.message || 'Invalid credentials',
        error: 'UNAUTHORIZED',
      });
    }

    req.logIn(user, (err) => {
      if (err) {
        console.error('💥 Login error:', err);
        return res.status(500).json({
          success: false,
          message: 'Login error',
          error: 'INTERNAL_SERVER_ERROR',
        });
      }

      // Store additional session data for database tracking
      req.session.userId = user.id;
      req.session.loginTime = new Date().toISOString();
      req.session.userAgent = req.get('User-Agent') || 'Unknown';

      // Save session explicitly to ensure it's stored in database
      req.session.save((sessionErr) => {
        if (sessionErr) {
          console.error('💥 Session save error:', sessionErr);
          // Don't fail the login if session save fails
        }

        console.log(`✅ User ${user.email} logged in successfully with session ${req.sessionID}`);

        res.json({
          success: true,
          message: 'Login successful',
          data: {
            user: {
              id: user.id,
              email: user.email,
              fullName: user.fullName,
              position: user.position,
              image_url: user.image_url,
              phone: user.phone,
            },
            sessionId: req.sessionID,
            loginTime: req.session.loginTime,
          },
        });
      });
    });
  })(req, res, next);
});

/**
 * POST /logout
 * Destroy session and logout user
 */
router.post('/logout', (req: Request, res: Response): void => {
  if (!req.isAuthenticated()) {
    res.status(401).json({
      success: false,
      message: 'Not authenticated',
      error: 'UNAUTHORIZED',
    });
    return;
  }

  const sessionId = req.sessionID;
  const userId = req.user?.id;

  console.log(`🚪 User ${req.user?.email} logging out, destroying session ${sessionId}`);

  req.logout((err) => {
    if (err) {
      console.error('💥 Logout error:', err);
      return res.status(500).json({
        success: false,
        message: 'Logout error',
        error: 'INTERNAL_SERVER_ERROR',
      });
    }

    // Destroy session in database and memory
    req.session.destroy(async (err) => {
      if (err) {
        console.error('💥 Session destruction error:', err);
        return res.status(500).json({
          success: false,
          message: 'Session destruction error',
          error: 'INTERNAL_SERVER_ERROR',
        });
      }

      try {
        // Explicitly remove session from database
        await prisma.session.deleteMany({
          where: {
            sessionId: sessionId,
          },
        });

        console.log(`✅ Session ${sessionId} successfully removed from database`);
      } catch (dbError) {
        console.error('💥 Database session cleanup error:', dbError);
        // Don't fail the logout if database cleanup fails
      }

      // Clear session cookie
      res.clearCookie('sessionId', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      });

      res.json({
        success: true,
        message: 'Logout successful',
        data: {
          sessionId: sessionId,
          logoutTime: new Date().toISOString(),
        },
      });
    });
  });
});

/**
 * GET /profile
 * Get current user profile
 */
router.get('/profile', requireAuth, (req: Request, res: Response): void => {
  res.json({
    success: true,
    message: 'Profile retrieved successfully',
    data: {
      user: req.user,
      sessionId: req.sessionID,
      sessionData: {
        loginTime: req.session.loginTime,
        userAgent: req.session.userAgent,
      },
    },
  });
});

/**
 * PUT /profile
 * Update user profile
 */
router.put('/profile', requireAuth, validate({ body: UpdateProfileSchema }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { fullName, position, phone, image_url } = req.body;
      const userId = req.user!.id;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        res.status(404).json({
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND',
        });
        return;
      }

      // Update user profile
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(fullName !== undefined && { fullName }),
          ...(position !== undefined && { position }),
          ...(phone !== undefined && { phone }),
          ...(image_url !== undefined && { image_url }),
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          position: true,
          image_url: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      console.log(`✅ Profile updated for user ${updatedUser.email}`);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: updatedUser,
          sessionId: req.sessionID,
          updatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('💥 Profile update error:', error);

      // Handle specific Prisma errors
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        res.status(409).json({
          success: false,
          message: 'Profile data conflicts with existing user',
          error: 'CONFLICT',
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_SERVER_ERROR',
      });
    }
  }
);


/**
 * GET /me
 * Get current authenticated user info
 */
router.get('/me', requireAuth, (req: Request, res: Response): void => {
  res.json({
    success: true,
    message: 'User info retrieved successfully',
    data: {
      user: req.user,
      sessionId: req.sessionID,
      isAuthenticated: req.isAuthenticated(),
    },
  });
});

/**
 * GET /session
 * Get current session information
 */
router.get('/session', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    // Get session from database
    const sessionData = await prisma.session.findUnique({
      where: { sessionId: req.sessionID },
      select: {
        id: true,
        sessionId: true,
        userId: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      message: 'Session info retrieved successfully',
      data: {
        sessionId: req.sessionID,
        user: req.user,
        sessionDatabase: sessionData,
        isAuthenticated: req.isAuthenticated(),
        sessionMemory: {
          loginTime: req.session.loginTime,
          userAgent: req.session.userAgent,
          userId: req.session.userId,
        },
      },
    });
  } catch (error) {
    console.error('💥 Session retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving session information',
      error: 'INTERNAL_SERVER_ERROR',
    });
  }
});

/**
 * GET /sessions
 * Get all active sessions for current user
 */
router.get('/sessions', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const userSessions = await prisma.session.findMany({
      where: {
        userId: userId,
        expiresAt: {
          gt: new Date(), // Only active sessions
        },
      },
      select: {
        id: true,
        sessionId: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    res.json({
      success: true,
      message: 'User sessions retrieved successfully',
      data: {
        currentSessionId: req.sessionID,
        sessions: userSessions,
        count: userSessions.length,
      },
    });
  } catch (error) {
    console.error('💥 Sessions retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user sessions',
      error: 'INTERNAL_SERVER_ERROR',
    });
  }
});

export default router;