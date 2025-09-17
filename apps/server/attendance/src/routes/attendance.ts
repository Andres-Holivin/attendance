import { Router, Response } from 'express';
import { AttendanceService } from '../service/attendance.service';
import { requireAuth } from '../middleware/auth';
import { body, query, param } from 'express-validator';
import { z } from 'zod';
import { validate } from '@workspace/utils';

const router = Router();

const getAttendanceValidation = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('userId').optional().isString().withMessage('User ID must be a string'),
    query('status').optional().isIn(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']).withMessage('Valid status is required'),
    query('startDate').optional().isISO8601().withMessage('Valid start date is required'),
    query('endDate').optional().isISO8601().withMessage('Valid end date is required'),
];

const getStatisticsValidation = [
    query('startDate').optional().isISO8601().withMessage('Valid start date is required'),
    query('endDate').optional().isISO8601().withMessage('Valid end date is required'),
];

const getDailyStatsValidation = [
    query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365'),
    query('startDate').optional().isISO8601().withMessage('Valid start date is required'),
    query('endDate').optional().isISO8601().withMessage('Valid end date is required'),
];
const todayAttendanceValidation = z.object({
    userId: z.string().min(1, { message: "User ID cannot be empty" }),
});


/**
 * GET /api/attendance
 * Get attendance records with optional filters
 */
router.get('/', requireAuth, getAttendanceValidation, AttendanceService.getAttendanceRecords);

/**
 * GET /api/attendance/statistics
 * Get attendance statistics for a date range
 */
router.get('/statistics', requireAuth, getStatisticsValidation, AttendanceService.getAttendanceStatistics);

/**
 * GET /api/attendance/daily-stats
 * Get daily attendance statistics for a date range or last N days
 */
router.get('/daily-stats', requireAuth, getDailyStatsValidation, AttendanceService.getDailyAttendanceStats);

/**
 * GET /api/attendance/today
 * Get today's attendance for the current user
 */
router.get(
    '/today',
    requireAuth,
    AttendanceService.getTodayAttendance
);
/**
 * GET /api/attendance/today/:userId
 * Get today's attendance for a specific user
 */
router.get(
    '/todayById/:userId',
    requireAuth,
    validate({ params: todayAttendanceValidation }),
    AttendanceService.getTodayAttendance
);

/**
 * POST /api/attendance/check-in
 * Check in current user (user ID from session)
 */
router.post('/check-in', requireAuth, AttendanceService.checkIn);

/**
 * POST /api/attendance/check-out
 * Check out current user (user ID from session)
 */
router.post('/check-out', requireAuth, AttendanceService.checkOut);

export default router;