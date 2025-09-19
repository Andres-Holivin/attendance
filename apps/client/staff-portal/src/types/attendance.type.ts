export interface AttendanceRecord {
    id: string;
    userId: string;
    dateIn: string; // ISO date string
    dateOut?: string; // ISO date string
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        email: string;
        fullName: string;
        position?: string;
    };
}

export interface AttendanceStatistics {
    totalEmployees: number;
    presentToday: number;
    absentToday: number;
    lateToday: number;
    onTimeToday: number;
}

export interface DailyAttendanceStats {
    date: string;
    totalWorkingHours: number;
}

export interface CombinedAttendanceStats {
    summary: AttendanceStatistics;
    daily: DailyAttendanceStats[];
}

export interface AttendanceFilters {
    userId?: string;
    startDate?: string;
    endDate?: string;
    status?: 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_TIME';
    page?: number;
    limit?: number;
}

export interface AttendancePaginatedResponse {
    attendances: AttendanceRecord[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_TIME';