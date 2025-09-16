import { Router } from "express";
import { prisma } from "../config/database";

const router = Router();

router.get('/health', async (req, res) => {
    try {
        // Check database connection
        await prisma.$queryRaw`SELECT 1`;

        res.json({
            success: true,
            message: 'Service is healthy',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
        });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(503).json({
            success: false,
            message: 'Service is unhealthy',
            error: 'DATABASE_CONNECTION_FAILED',
            timestamp: new Date().toISOString(),
        });
    }
});

export default router;