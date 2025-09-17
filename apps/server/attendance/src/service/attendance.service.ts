import { prisma } from '../config/database';
import moment from 'moment';
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

            filters.startDate = moment.utc(filters.startDate).startOf('day').toDate();
            filters.endDate = moment.utc(filters.endDate).endOf('day').toDate();


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

    static async getAttendanceStatistics(req: any, res: any): Promise<void> {
        try {
            const { startDate, endDate } = req.query;

            // Default to today if no dates provided
            let filterStartDate = new Date();
            let filterEndDate = new Date();

            if (startDate) {
                filterStartDate = new Date(startDate);
            }
            if (endDate) {
                filterEndDate = new Date(endDate);
            }

            // Set time boundaries for the day
            filterStartDate = moment.utc(filterStartDate).startOf('day').toDate();
            filterEndDate = moment.utc(filterEndDate).endOf('day').toDate();

            console.log('Filtering statistics from', filterStartDate, 'to', filterEndDate);

            // Get all users count
            const totalEmployees = await prisma.user.count();

            // Get attendance records for the date range
            const attendanceRecords = await prisma.attendance.findMany({
                where: {
                    dateIn: {
                        gte: filterStartDate,
                        lte: filterEndDate,
                    }
                },
                include: {
                    user: true
                }
            });

            const presentInRange = attendanceRecords.length;
            const absentInRange = totalEmployees - presentInRange;

            // Calculate late arrivals (assuming work starts at 9 AM)
            const lateInRange = attendanceRecords.filter(attendance => {
                const checkInDate = new Date(attendance.dateIn);
                const workStartTime = new Date(checkInDate);
                workStartTime.setHours(9, 0, 0, 0);
                return checkInDate > workStartTime;
            }).length;

            const onTimeInRange = presentInRange - lateInRange;

            const statistics = {
                totalEmployees,
                presentToday: presentInRange,
                absentToday: absentInRange,
                lateToday: lateInRange,
                onTimeToday: onTimeInRange,
            };

            res.json({
                success: true,
                message: 'Attendance statistics retrieved successfully',
                data: statistics,
            });
        } catch (error: any) {
            console.error('Error getting attendance statistics:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get attendance statistics',
                error: 'INTERNAL_SERVER_ERROR',
            });
        }
    }

    static async getDailyAttendanceStats(req: any, res: any): Promise<void> {
        try {
            const { days, startDate, endDate } = req.query;

            let filterStartDate: Date;
            let filterEndDate: Date;

            // If specific date range is provided, use it
            if (startDate && endDate) {
                filterStartDate = new Date(startDate);
                filterEndDate = new Date(endDate);
            } else {
                // Otherwise, use the days parameter (default 14)
                const daysCount = parseInt(days) || 14;
                filterEndDate = new Date();
                filterStartDate = new Date();
                filterStartDate.setDate(filterStartDate.getDate() - daysCount);
            }

            filterStartDate = moment.utc(filterStartDate).startOf('day').toDate();
            filterEndDate = moment.utc(filterEndDate).endOf('day').toDate();

            console.log('Filtering statistics from', filterStartDate, 'to', filterEndDate);

            // Get attendance records for the date range with dateOut
            const attendanceRecords = await prisma.attendance.findMany({
                where: {
                    dateIn: {
                        gte: filterStartDate,
                        lte: filterEndDate,
                    }
                },
                select: {
                    dateIn: true,
                    dateOut: true,
                }
            });

            // Calculate the number of days between start and end
            const daysDiff = Math.ceil((filterEndDate.getTime() - filterStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

            // Group by date and calculate stats
            const dailyStats = [];
            const workStartTime = 9; // 9 AM

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

                const present = dayAttendance.length;

                // Calculate late arrivals
                const workStart = new Date(currentDate);
                workStart.setHours(workStartTime, 0, 0, 0);

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

            res.json({
                success: true,
                message: 'Daily attendance statistics retrieved successfully',
                data: dailyStats,
            });
        } catch (error: any) {
            console.error('Error getting daily attendance statistics:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get daily attendance statistics',
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