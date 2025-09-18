import { useAtom, useAtomValue } from 'jotai';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AttendanceService } from '@/services/attendance.service';
import { attendanceFiltersAtom, dateRangeAtom, paginationAtom, setDateRangeAtom, setPaginationAtom } from '@/store/attendance-filters';

export const ATTENDANCE_KEYS = {
    todayAttendance: (userId?: string) => ['today-attendance', userId],
    attendanceRecords: (filters: any) => ['attendance-records', filters],
    attendanceStatistics: (filters?: { startDate?: string; endDate?: string }) => ['attendance-statistics', filters],
    dailyStats: (filters?: { days?: number; startDate?: string; endDate?: string }) => ['daily-attendance-stats', filters],
}

// Enhanced hooks with Jotai integration
export function useAttendanceFiltersAtoms() {
    const [filters, setFilters] = useAtom(attendanceFiltersAtom);
    const [dateRange, setDateRange] = useAtom(dateRangeAtom);
    const [pagination, setPagination] = useAtom(paginationAtom);
    const [, setDateRangeAction] = useAtom(setDateRangeAtom);
    const [, setPaginationAction] = useAtom(setPaginationAtom);

    return {
        filters,
        setFilters,
        dateRange,
        setDateRange,
        pagination,
        setPagination,
        setDateRangeAction,
        setPaginationAction,
    };
}

export function useCheckIn() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => AttendanceService.checkIn(),
        onSuccess: () => {
            // Invalidate and refetch attendance data
            queryClient.invalidateQueries({ queryKey: ['today-attendance'] });
            queryClient.invalidateQueries({ queryKey: ['attendance-statistics'] });
            queryClient.invalidateQueries({ queryKey: ['daily-attendance-stats'] });
            queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
        },
    })
}

export function useCheckOut() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => AttendanceService.checkOut(),
        onSuccess: () => {
            // Invalidate and refetch attendance data
            queryClient.invalidateQueries({ queryKey: ['today-attendance'] });
            queryClient.invalidateQueries({ queryKey: ['attendance-statistics'] });
            queryClient.invalidateQueries({ queryKey: ['daily-attendance-stats'] });
            queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
        },
    })
}

export function useTodayAttendance(userId?: string) {
    return useQuery({
        queryKey: ATTENDANCE_KEYS.todayAttendance(userId),
        queryFn: () => AttendanceService.getTodayAttendance(userId),
    })
}

export function useAttendanceRecordsWithFilters() {
    const filters = useAtomValue(attendanceFiltersAtom);

    return useQuery({
        queryKey: ATTENDANCE_KEYS.attendanceRecords(filters),
        queryFn: () => AttendanceService.getAttendanceRecords(filters),
        placeholderData: (previousData) => previousData,
    })
}

export function useAttendanceStatisticsWithFilters() {
    const dateRange = useAtomValue(dateRangeAtom);

    return useQuery({
        queryKey: ATTENDANCE_KEYS.attendanceStatistics(dateRange),
        queryFn: () => AttendanceService.getAttendanceStatistics(dateRange),
        refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    })
}

export function useDailyAttendanceStatsWithFilters() {
    const dateRange = useAtomValue(dateRangeAtom);

    return useQuery({
        queryKey: ATTENDANCE_KEYS.dailyStats(dateRange),
        queryFn: () => AttendanceService.getDailyAttendanceStats(dateRange),
        refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    })
}

// Legacy hooks for backward compatibility (using manual filters)
export function useAttendanceRecords(filters: any = {}) {
    return useQuery({
        queryKey: ATTENDANCE_KEYS.attendanceRecords(filters),
        queryFn: () => AttendanceService.getAttendanceRecords(filters),
        placeholderData: (previousData) => previousData,
    })
}

export function useAttendanceStatistics(filters?: { startDate?: string; endDate?: string }) {
    return useQuery({
        queryKey: ATTENDANCE_KEYS.attendanceStatistics(filters),
        queryFn: () => AttendanceService.getAttendanceStatistics(filters),
        refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    })
}

export function useDailyAttendanceStats(filters?: { days?: number; startDate?: string; endDate?: string }) {
    return useQuery({
        queryKey: ATTENDANCE_KEYS.dailyStats(filters),
        queryFn: () => AttendanceService.getDailyAttendanceStats(filters),
        refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    })
}