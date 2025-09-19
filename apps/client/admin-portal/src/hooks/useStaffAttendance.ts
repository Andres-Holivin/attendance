import { useQuery } from '@tanstack/react-query'
import { AttendanceService } from '@/services/attendance.service'
import { AttendanceFilters } from '@/types/attendance.type'

// Query keys for staff attendance
export const staffAttendanceKeys = {
    all: ['staff-attendance'] as const,
    staff: (staffId: string) => [...staffAttendanceKeys.all, 'staff', staffId] as const,
    staffWithFilters: (staffId: string, filters: AttendanceFilters) =>
        [...staffAttendanceKeys.staff(staffId), 'filtered', filters] as const,
}

/**
 * Hook for fetching attendance records for a specific staff member
 */
export function useStaffAttendanceRecords(filters: AttendanceFilters) {
    const staffId = filters.userId

    return useQuery({
        queryKey: staffAttendanceKeys.staffWithFilters(staffId || '', filters),
        queryFn: () => {
            if (!staffId) {
                throw new Error('Staff ID is required')
            }
            return AttendanceService.getStaffAttendanceRecords(staffId, filters)
        },
        enabled: !!staffId,
        staleTime: 30 * 1000, // 30 seconds
    })
}