import { useAtom } from 'jotai';
import { dateRangeAtom, setDateRangeAtom } from '@/store/attendance-filters';

export function useDateRangeFilter() {
    const [dateRange] = useAtom(dateRangeAtom);
    const [, setDateRange] = useAtom(setDateRangeAtom);

    const handleStartDateChange = (date?: Date) => {
        setDateRange({
            startDate: date,
            endDate: dateRange.endDate ? new Date(dateRange.endDate) : undefined,
        });
    };

    const handleEndDateChange = (date?: Date) => {
        setDateRange({
            startDate: dateRange.startDate ? new Date(dateRange.startDate) : undefined,
            endDate: date,
        });
    };

    const handleDateRangeChange = (startDate?: Date, endDate?: Date) => {
        setDateRange({ startDate, endDate });
    };

    return {
        dateRange,
        handleStartDateChange,
        handleEndDateChange,
        handleDateRangeChange,
    };
}