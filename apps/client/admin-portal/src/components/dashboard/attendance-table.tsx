import { useMemo } from "react";
import { DataTable } from "../data-table";
import { useAttendanceRecordsWithFilters } from "@/hooks/useAttendanceWithAtoms";
import { usePaginationFilter } from "@/hooks/usePaginationFilter";
import { DashboardAttendanceColumns } from "../table-column/dashboard-attendance-columns";

export function AttendanceTable() {
    const { data: attendanceData, isLoading: attendanceLoading } = useAttendanceRecordsWithFilters();
    const { pagination, handlePaginationChange, tableState } = usePaginationFilter();

    const attendanceRecords = useMemo(() => {
        return attendanceData?.data?.attendances || [];
    }, [attendanceData]);

    const totalRecords = useMemo(() => {
        return attendanceData?.data?.pagination?.total || 0;
    }, [attendanceData]);

    const pageCount = useMemo(() => {
        return Math.ceil(totalRecords / (pagination.limit || 10));
    }, [totalRecords, pagination.limit]);
    
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Attendance Records</h2>
            <DataTable
                columns={DashboardAttendanceColumns}
                data={attendanceRecords}
                loading={attendanceLoading}
                pagination={tableState}
                pageCount={pageCount}
                totalRecords={totalRecords}
                onPaginationChange={handlePaginationChange}
            />
        </div>
    )
}