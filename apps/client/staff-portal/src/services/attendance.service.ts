
import { api, buildUrlWithParams } from "@/lib/proxy-api"
import { BaseApiResponse } from "@/types/base-api.type"
import { AttendanceFilters, AttendancePaginatedResponse, CombinedAttendanceStats } from "@/types/attendance.type"

export const AttendanceService = {
    checkIn: async (): Promise<BaseApiResponse> => {
        return await api.post('/attendance/check-in')
    },
    
    checkOut: async (): Promise<BaseApiResponse> => {
        return await api.post('/attendance/check-out')
    },
    
    getTodayAttendance: async (userId?: string): Promise<BaseApiResponse> => {
        const url = userId ? `/attendance/today/${userId}` : '/attendance/today'
        return await api.get(url)
    },
    
    getAttendanceRecords: async (filters: AttendanceFilters = {}): Promise<BaseApiResponse & { data: AttendancePaginatedResponse }> => {
        const url = buildUrlWithParams('/attendance', filters)
        return await api.get(url)
    },
    
    getCombinedStats: async (filters?: { days?: number; startDate?: string; endDate?: string }): Promise<BaseApiResponse & { data: CombinedAttendanceStats }> => {
        const url = buildUrlWithParams('/attendance/stats', filters)
        return await api.get(url)
    }
}
