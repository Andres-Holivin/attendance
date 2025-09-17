import { atom } from 'jotai';
import { AttendanceFilters } from '@/types/attendance.type';
import moment from 'moment';

// Base atom for attendance filters
export const attendanceFiltersAtom = atom<AttendanceFilters>({
    page: 1,
    limit: 10,
    // Default to today's date for initial load
    startDate: moment().format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD'),
});

// Derived atoms for specific filter parts
export const dateRangeAtom = atom(
    (get) => ({
        startDate: get(attendanceFiltersAtom).startDate,
        endDate: get(attendanceFiltersAtom).endDate,
    }),
    (get, set, update: { startDate?: string; endDate?: string }) => {
        set(attendanceFiltersAtom, {
            ...get(attendanceFiltersAtom),
            ...update,
            page: 1, // Reset to first page when date changes
        });
    }
);

export const paginationAtom = atom(
    (get) => ({
        page: get(attendanceFiltersAtom).page || 1,
        limit: get(attendanceFiltersAtom).limit || 10,
    }),
    (get, set, update: { page?: number; limit?: number }) => {
        set(attendanceFiltersAtom, {
            ...get(attendanceFiltersAtom),
            ...update,
        });
    }
);

// Action atoms for common operations
export const resetFiltersAtom = atom(null, (get, set) => {
    set(attendanceFiltersAtom, {
        page: 1,
        limit: 10,
        startDate: moment().format('YYYY-MM-DD'),
        endDate: moment().format('YYYY-MM-DD'),
    });
});

export const setDateRangeAtom = atom(null, (get, set, dates: { startDate?: Date; endDate?: Date }) => {
    set(dateRangeAtom, {
        startDate: moment(dates.startDate).format('YYYY-MM-DD'),
        endDate: moment(dates.endDate).format('YYYY-MM-DD'),
    });
});

export const setPaginationAtom = atom(null, (get, set, pagination: { pageIndex: number; pageSize: number }) => {
    set(paginationAtom, {
        page: pagination.pageIndex + 1, // Convert 0-based to 1-based
        limit: pagination.pageSize,
    });
});