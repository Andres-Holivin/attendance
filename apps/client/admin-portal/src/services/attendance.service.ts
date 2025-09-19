
import { BaseApiResponse } from "@/types/base-api.type"
import { AttendanceFilters, AttendancePaginatedResponse, CombinedAttendanceStats } from "@/types/attendance.type"
import { api, buildUrlWithParams } from "@/lib/proxy-api"

export const AttendanceService = {
    checkIn: async (): Promise<BaseApiResponse> => {
        return api.post('/attendance/check-in');
    },

    checkOut: async (): Promise<BaseApiResponse> => {
        return api.post('/attendance/check-out');
    },

    getTodayAttendance: async (userId?: string): Promise<BaseApiResponse> => {
        const url = userId ? `/attendance/today/${userId}` : '/attendance/today';
        return api.get(url);
    },

    getAttendanceRecords: async (filters: AttendanceFilters = {}): Promise<BaseApiResponse & { data: AttendancePaginatedResponse }> => {
        const url = buildUrlWithParams('/attendance', filters);
        return api.get(url);
    },

    getStaffAttendanceRecords: async (staffId: string, filters: AttendanceFilters = {}): Promise<BaseApiResponse & { data: AttendancePaginatedResponse }> => {
        const filtersWithStaff = { ...filters, userId: staffId };
        const url = buildUrlWithParams('/attendance', filtersWithStaff);
        return api.get(url);
    },

    getCombinedStats: async (filters?: { days?: number; startDate?: string; endDate?: string }): Promise<BaseApiResponse & { data: CombinedAttendanceStats }> => {
        const url = buildUrlWithParams('/attendance/stats', filters || {});
        return api.get(url);
    }
}
