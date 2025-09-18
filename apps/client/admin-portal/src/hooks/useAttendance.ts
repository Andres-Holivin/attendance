import { AttendanceService } from '@/services/attendance.service';
import { useMutation, useQuery } from '@tanstack/react-query';


export const ATTENDANCE_KEYS = {
    todayAttendance: (userId?: string) => ['today-attendance', userId],
}

export function useCheckIn() {
    return useMutation({
        mutationFn: () => AttendanceService.checkIn(),
    })
}
export function useCheckOut() {
    return useMutation({
        mutationFn: () => AttendanceService.checkOut(),
    })
}

export function useTodayAttendance(userId?: string) {
    return useQuery({
        queryKey: ATTENDANCE_KEYS.todayAttendance(userId),
        queryFn: () => AttendanceService.getTodayAttendance(userId),
    })
}