import express from 'express';
import { ApiLogService } from '../service/api-log.service';
import { requireAuth } from '@/middleware/auth';

const router = express.Router();

/**
 * GET /api/logs
 * Get API logs with optional filters
 */
router.get('/', requireAuth, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50,
            service,
            method,
            status,
            userEmail,
            sessionId,
            startDate,
            endDate
        } = req.query;

        const filters: any = {};

        if (service) filters.service = service as string;
        if (method) filters.method = method as string;
        if (status) filters.status = parseInt(status as string);
        if (userEmail) filters.userEmail = userEmail as string;
        if (sessionId) filters.sessionId = sessionId as string;
        if (startDate) filters.startDate = new Date(startDate as string);
        if (endDate) filters.endDate = new Date(endDate as string);

        filters.userId = req.user?.id ?? "";

        const result = await ApiLogService.getLogs(
            parseInt(page as string),
            parseInt(limit as string),
            filters,
        );

        res.json({
            success: true,
            message: 'API logs retrieved successfully',
            data: result
        });
    } catch (error: any) {
        console.error('Error retrieving API logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve API logs',
            error: error.message
        });
    }
});



/**
 * GET /api/logs/stats
 * Get API logging statistics
 */
router.get('/stats', async (req, res) => {
    try {
        // This could be expanded to include more statistics
        res.json({
            success: true,
            message: 'API logging statistics',
            data: {
                message: 'Statistics endpoint - can be expanded with specific metrics'
            }
        });
    } catch (error: any) {
        console.error('Error retrieving API log statistics:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve API log statistics',
            error: 'INTERNAL_SERVER_ERROR'
        });
    }
});

export default router;