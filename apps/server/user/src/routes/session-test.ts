import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';

const router = Router();

// Extend session data interface
declare module 'express-session' {
    interface SessionData {
        visitCount?: number;
    }
}

// Test session storage
router.get('/test-session', (req: Request, res: Response) => {
    // Set some test data in session
    if (!req.session.visitCount) {
        req.session.visitCount = 1;
    } else {
        req.session.visitCount++;
    }

    res.json({
        success: true,
        message: 'Session test',
        sessionId: req.sessionID,
        visitCount: req.session.visitCount,
        user: req.user || null,
    });
});

// Get all sessions from database (for testing purposes)
router.get('/sessions', async (req: Request, res: Response) => {
    try {
        const sessions = await prisma.session.findMany({
            select: {
                id: true,
                sessionId: true,
                userId: true,
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
            sessions,
            count: sessions.length,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching sessions',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// Clear all sessions (for testing purposes)
router.delete('/sessions', async (req: Request, res: Response) => {
    try {
        const result = await prisma.session.deleteMany({});

        res.json({
            success: true,
            message: 'All sessions cleared',
            deletedCount: result.count,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error clearing sessions',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

export default router;