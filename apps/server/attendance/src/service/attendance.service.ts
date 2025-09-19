import { prisma } from '../config/database';
import moment from 'moment';
import { Request, Response } from 'express';
export interface CreateAttendanceData {
    userId: string;
    dateIn: Date;
}

export interface UpdateAttendanceData {
    dateOut?: Date;
}

export interface AttendanceFilters {
    userId?: string;
    startDate?: Date;
    endDate?: Date;
}

export class AttendanceService {
    static async getAttendanceRecords(req: any, res: any): Promise<void> {
        try {
            const appSource = req.appSource;
            const {
                page = 1,
                limit = 10,
                userId,
                status,
                startDate,
                endDate,
            } = req.query;

            const filters: any = {};
            if (userId) filters.userId = userId;
            if (status) filters.status = status;
            if (startDate) filters.startDate = new Date(startDate);
            if (endDate) filters.endDate = new Date(endDate);

            filters.startDate = moment(filters.startDate).startOf('day').toDate();
            filters.endDate = moment(filters.endDate).endOf('day').toDate();

            if (appSource === 'staff-portal') {
                // Staff can only see their own records
                filters.userId = req.user?.id ?? "";
            }


            console.log('Filtering statistics from', filters.startDate, 'to', filters.endDate);
            const result = await _getAttendanceRecords(
                filters,
                parseInt(page),
                parseInt(limit)
            );

            res.json({
                success: true,
                message: 'Attendance records retrieved successfully',
                data: result,
            });
        } catch (error: any) {
            console.error('Error getting attendance records:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get attendance records',
                error: 'INTERNAL_SERVER_ERROR',
            });
        }
    }

    static async getStats(req: Request, res: Response): Promise<void> {
        try {
            const { days, startDate, endDate }: any = req.query;
            const appSource = req.appSource;
            if (appSource !== 'admin-portal' && appSource !== 'staff-portal') {
                res.status(403).json({
                    success: false,
                    message: 'Access denied',
                    error: 'FORBIDDEN',
                });
                return;
            }

            // Determine date range
            let filterStartDate: Date;
            let filterEndDate: Date;

            if (startDate && endDate) {
                filterStartDate = new Date(startDate);
                filterEndDate = new Date(endDate);
            } else {
                // Use days parameter (default 14) or default to today for summary
                const daysCount = parseInt(days) || 14;
                filterEndDate = new Date();
                filterStartDate = new Date();
                filterStartDate.setDate(filterStartDate.getDate() - daysCount);
            }

            filterStartDate = moment(filterStartDate).startOf('day').toDate();
            filterEndDate = moment(filterEndDate).endOf('day').toDate();

            console.log('Filtering statistics from', filterStartDate, 'to', filterEndDate);

            // For staff portal, filter by current user only
            const userFilter = appSource === 'staff-portal' ? { id: req.user?.id ?? "" } : {};

            // Get total employees count (for staff portal, it's just 1 - the current user)
            const totalEmployees = await prisma.user.count({
                where: userFilter
            });

            // Get attendance records for the date range with proper user filtering
            const attendanceRecords = await prisma.attendance.findMany({
                where: {
                    ...(appSource === 'staff-portal' ? { userId: req.user?.id } : {}),
                    dateIn: {
                        gte: filterStartDate,
                        lte: filterEndDate,
                    }
                },
                select: {
                    dateIn: true,
                    dateOut: true,
                    userId: true,
                }
            });

            // For the selected period, calculate statistics differently based on app source
            let presentInRange: number;
            let absentInRange: number;
            let lateInRange: number;
            let onTimeInRange: number;

            if (appSource === 'staff-portal') {
                // For staff portal: count attendance days for the current user
                presentInRange = attendanceRecords.length; // Number of days the user was present

                // Calculate total working days in the date range
                const totalWorkingDays = Math.ceil((filterEndDate.getTime() - filterStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                absentInRange = totalWorkingDays - presentInRange; // Days the user was absent

                // Count late days
                lateInRange = attendanceRecords.filter(attendance => {
                    const checkInDate = new Date(attendance.dateIn);
                    const workStartTime = new Date(checkInDate);
                    workStartTime.setHours(9, 0, 0, 0);
                    return checkInDate > workStartTime;
                }).length;

                onTimeInRange = presentInRange - lateInRange;
            } else {
                // For admin portal: calculate unique users and their attendance patterns
                const uniqueUserIds = new Set(attendanceRecords.map(record => record.userId));
                presentInRange = uniqueUserIds.size; // Number of unique users who attended during the period
                const totalWorkingDays = Math.ceil((filterEndDate.getTime() - filterStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                console.log('Total working days in range:', totalWorkingDays);
                console.log('Present days in range:', presentInRange);
                console.log('Absent days in range:', totalEmployees);
                absentInRange = (totalWorkingDays * totalEmployees) - presentInRange; // Users who never attended during the period

                // Count unique users who were late (not total late instances)
                const lateUserIds = new Set(
                    attendanceRecords
                        .filter(attendance => {
                            const checkInDate = new Date(attendance.dateIn);
                            const workStartTime = new Date(checkInDate);
                            workStartTime.setHours(9, 0, 0, 0);
                            return checkInDate > workStartTime;
                        })
                        .map(record => record.userId)
                );

                lateInRange = lateUserIds.size; // Number of unique users who were late during the period

                // Count unique users who were on time (attended but never late)
                const onTimeUserIds = new Set();
                uniqueUserIds.forEach(userId => {
                    if (!lateUserIds.has(userId)) {
                        onTimeUserIds.add(userId);
                    }
                });

                onTimeInRange = onTimeUserIds.size;
            }

            const summaryStatistics = {
                totalEmployees,
                presentToday: presentInRange,
                absentToday: absentInRange,
                lateToday: lateInRange,
                onTimeToday: onTimeInRange,
                // Add period-specific metadata
                periodStart: moment(filterStartDate).format('YYYY-MM-DD'),
                periodEnd: moment(filterEndDate).format('YYYY-MM-DD'),
                totalDaysInPeriod: Math.ceil((filterEndDate.getTime() - filterStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
            };

            // Calculate daily breakdown statistics
            const daysDiff = Math.ceil((filterEndDate.getTime() - filterStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            const dailyStats = [];

            for (let i = 0; i < daysDiff; i++) {
                const currentDate = new Date(filterStartDate);
                currentDate.setDate(filterStartDate.getDate() + i);

                const dayStart = new Date(currentDate);
                dayStart.setHours(0, 0, 0, 0);
                const dayEnd = new Date(currentDate);
                dayEnd.setHours(23, 59, 59, 999);

                const dayAttendance = attendanceRecords.filter(record => {
                    const recordDate = new Date(record.dateIn);
                    return recordDate >= dayStart && recordDate <= dayEnd;
                });

                // Calculate working hours for this day
                const workingHours = dayAttendance.reduce((totalHours, record) => {
                    if (record.dateOut) {
                        const checkIn = new Date(record.dateIn);
                        const checkOut = new Date(record.dateOut);
                        const hoursWorked = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
                        return totalHours + hoursWorked;
                    }
                    return totalHours;
                }, 0);

                dailyStats.push({
                    date: moment(currentDate).format('YYYY-MM-DD'),
                    totalWorkingHours: Math.round(workingHours * 10) / 10,
                });
            }

            // Return both summary and daily statistics in a single response
            res.json({
                success: true,
                message: 'Attendance statistics retrieved successfully',
                data: {
                    summary: summaryStatistics,
                    daily: dailyStats,
                },
            });

        } catch (error: any) {
            console.error('Error getting attendance stats:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get attendance stats',
                error: 'INTERNAL_SERVER_ERROR',
            });
        }
    }

    static async checkOut(req: any, res: any): Promise<void> {
        try {
            // User ID is automatically available from session via auth middleware
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                    error: 'UNAUTHORIZED',
                });
                return;
            }

            // Get today's attendance record
            const attendance = await _getTodayAttendance(userId);

            if (!attendance) {
                res.status(404).json({
                    success: false,
                    message: 'No check-in record found for today',
                    error: 'NOT_CHECKED_IN',
                });
                return;
            }

            if (attendance.dateOut) {
                res.status(400).json({
                    success: false,
                    message: 'User already checked out today',
                    error: 'ALREADY_CHECKED_OUT',
                    data: attendance,
                });
                return;
            }

            const updatedAttendance = await _updateAttendance(attendance.id, {
                dateOut: new Date(),
            });

            res.json({
                success: true,
                message: 'Checked out successfully',
                data: updatedAttendance,
                user: {
                    id: req.user.id,
                    email: req.user.email,
                    name: req.user.name
                }
            });
        } catch (error: any) {
            console.error('Error checking out:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to check out',
                error: 'INTERNAL_SERVER_ERROR',
            });
        }
    }

    static async checkIn(req: any, res: any): Promise<void> {
        try {
            // User ID is automatically available from session via auth middleware
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                    error: 'UNAUTHORIZED',
                });
                return;
            }

            // Check if user already checked in today
            const existingAttendance = await _getTodayAttendance(userId);

            if (existingAttendance) {
                res.status(400).json({
                    success: false,
                    message: 'User already checked in today',
                    error: 'ALREADY_CHECKED_IN',
                    data: existingAttendance,
                });
                return;
            }

            const attendance = await _createAttendance({
                userId: userId,
                dateIn: new Date(),
            });

            res.status(201).json({
                success: true,
                message: 'Checked in successfully',
                data: attendance,
                user: {
                    id: req.user.id,
                    email: req.user.email,
                    name: req.user.name
                }
            });
        } catch (error: any) {
            console.error('Error checking in:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to check in',
                error: 'INTERNAL_SERVER_ERROR',
            });
        }
    };

    static async getTodayAttendance(req: any, res: any): Promise<void> {
        try {
            let userId = req.params.userId ?? req.user?.id;
            console.log('User ID from session:', userId);
            if (!userId) {
                res.status(400).json({
                    success: false,
                    message: 'User ID is required',
                    error: 'BAD_REQUEST',
                });
                return;
            }

            const attendance = await _getTodayAttendance(userId);

            res.json({
                success: true,
                message: attendance ? 'Today\'s attendance found' : 'No attendance record for today',
                data: attendance,
            });
        } catch (error: any) {
            console.error('Error getting today\'s attendance:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get today\'s attendance',
                error: 'INTERNAL_SERVER_ERROR',
            });
        }
    }
}
async function _updateAttendance(id: string, data: UpdateAttendanceData) {
    try {
        const attendance = await prisma.attendance.update({
            where: { id },
            data,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                        position: true,
                    }
                }
            }
        });
        return attendance;
    } catch (error) {
        console.error('Error updating attendance:', error);
        throw new Error('Failed to update attendance record');
    }
}

async function _getAttendanceRecords(filters: AttendanceFilters = {}, page = 1, limit = 10) {
    try {
        const skip = (page - 1) * limit;

        const where: any = {};

        if (filters.userId) {
            where.userId = filters.userId;
        }

        if (filters.startDate || filters.endDate) {
            where.dateIn = {};
            if (filters.startDate) {
                where.dateIn.gte = filters.startDate;
            }
            if (filters.endDate) {
                where.dateIn.lte = filters.endDate;
            }
        }

        const [attendances, total] = await Promise.all([
            prisma.attendance.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            fullName: true,
                            position: true,
                        }
                    }
                },
                orderBy: { dateIn: 'desc' },
                skip,
                take: limit,
            }),
            prisma.attendance.count({ where })
        ]);

        return {
            attendances,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            }
        };
    } catch (error) {
        console.error('Error getting attendance records:', error);
        throw new Error('Failed to get attendance records');
    }
}

async function _createAttendance(data: CreateAttendanceData) {
    try {
        const attendance = await prisma.attendance.create({
            data,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                        position: true,
                    }
                }
            }
        });
        return attendance;
    } catch (error) {
        console.error('Error creating attendance:', error);
        throw new Error('Failed to create attendance record');
    }
}
async function _getTodayAttendance(userId: string) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const attendance = await prisma.attendance.findFirst({
            where: {
                userId,
                dateIn: {
                    gte: today,
                    lt: tomorrow,
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                        position: true,
                    }
                }
            }
        });

        return attendance;
    } catch (error) {
        console.error('Error getting today attendance:', error);
        throw new Error('Failed to get today attendance');
    }
}