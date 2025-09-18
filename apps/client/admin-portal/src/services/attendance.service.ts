
import { API, APIUrlEnum } from "@/lib/api"
import { BaseApiResponse } from "@/types/base-api.type"
import { AttendanceFilters, AttendancePaginatedResponse, AttendanceStatistics, DailyAttendanceStats } from "@/types/attendance.type"

export const AttendanceService = {
    checkIn: async (): Promise<BaseApiResponse> => {
        const response = await API(APIUrlEnum.ATTENDANCE_API).post('/attendance/check-in')
        return response.data
    },
    checkOut: async (): Promise<BaseApiResponse> => {
        const response = await API(APIUrlEnum.ATTENDANCE_API).post('/attendance/check-out')
        return response.data
    },
    getTodayAttendance: async (userId?: string): Promise<BaseApiResponse> => {
        const url = userId ? `/attendance/today/${userId}` : '/attendance/today'
        const response = await API(APIUrlEnum.ATTENDANCE_API).get(url)
        return response.data
    },
    getAttendanceRecords: async (filters: AttendanceFilters = {}): Promise<BaseApiResponse & { data: AttendancePaginatedResponse }> => {
        const params = new URLSearchParams()

        if (filters.userId) params.append('userId', filters.userId)
        if (filters.startDate) params.append('startDate', filters.startDate)
        if (filters.endDate) params.append('endDate', filters.endDate)
        if (filters.status) params.append('status', filters.status)
        if (filters.page) params.append('page', filters.page.toString())
        if (filters.limit) params.append('limit', filters.limit.toString())

        const queryString = params.toString()
        const url = queryString ? `/attendance?${queryString}` : '/attendance'
        const response = await API(APIUrlEnum.ATTENDANCE_API).get(url)
        return response.data
    },
    getAttendanceStatistics: async (filters?: { startDate?: string; endDate?: string }): Promise<BaseApiResponse & { data: AttendanceStatistics }> => {
        const params = new URLSearchParams()

        if (filters?.startDate) params.append('startDate', filters.startDate)
        if (filters?.endDate) params.append('endDate', filters.endDate)

        const queryString = params.toString()
        const url = queryString ? `/attendance/statistics?${queryString}` : '/attendance/statistics'
        const response = await API(APIUrlEnum.ATTENDANCE_API).get(url)
        return response.data
    },
    getDailyAttendanceStats: async (filters?: { days?: number; startDate?: string; endDate?: string }): Promise<BaseApiResponse & { data: DailyAttendanceStats[] }> => {
        const params = new URLSearchParams()

        if (filters?.days) params.append('days', filters.days.toString())
        if (filters?.startDate) params.append('startDate', filters.startDate)
        if (filters?.endDate) params.append('endDate', filters.endDate)

        const queryString = params.toString()
        const url = queryString ? `/attendance/daily-stats?${queryString}` : '/attendance/daily-stats'
        const response = await API(APIUrlEnum.ATTENDANCE_API).get(url)
        return response.data
    }
}
