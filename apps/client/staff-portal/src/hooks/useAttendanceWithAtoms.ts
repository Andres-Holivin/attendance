import { useAtom, useAtomValue } from 'jotai';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AttendanceService } from '@/services/attendance.service';
import { attendanceFiltersAtom, dateRangeAtom, paginationAtom, setDateRangeAtom, setPaginationAtom } from '@/store/attendance-filters';

export const ATTENDANCE_KEYS = {
    todayAttendance: (userId?: string) => ['today-attendance', userId],
    attendanceRecords: (filters: any) => ['attendance-records', filters],
    combinedStats: (filters?: { days?: number; startDate?: string; endDate?: string }) => ['combined-attendance-stats', filters],
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
            queryClient.invalidateQueries({ queryKey: ['combined-attendance-stats'] });
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
            queryClient.invalidateQueries({ queryKey: ['combined-attendance-stats'] });
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

export function useCombinedAttendanceStatsWithFilters() {
    const dateRange = useAtomValue(dateRangeAtom);

    return useQuery({
        queryKey: ATTENDANCE_KEYS.combinedStats(dateRange),
        queryFn: () => AttendanceService.getCombinedStats(dateRange),
        refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
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

export function useCombinedAttendanceStats(filters?: { days?: number; startDate?: string; endDate?: string }) {
    return useQuery({
        queryKey: ATTENDANCE_KEYS.combinedStats(filters),
        queryFn: () => AttendanceService.getCombinedStats(filters),
        refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    })
}