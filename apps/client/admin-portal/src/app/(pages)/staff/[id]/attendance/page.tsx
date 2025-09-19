"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Download } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { DataTable } from "@/components/data-table"
import { DashboardAttendanceColumns } from "@/components/table-column/dashboard-attendance-columns"
import { useStaffAttendanceRecords } from "@/hooks/useStaffAttendance"
import { useStaffById } from "@/hooks/useStaff"
import Content from "@/components/content"
import { AttendanceFilters } from "@/types/attendance.type"
import { DatePickerRange } from "@workspace/ui/components/date-picker-range"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"

export default function StaffAttendancePage() {
    const params = useParams()
    const router = useRouter()
    const staffId = params.id as string

    // State for filters and pagination
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
    const [dateRange, setDateRange] = useState<DateRange | undefined>()

    // Build filters for attendance query
    const attendanceFilters: AttendanceFilters = useMemo(() => {
        const filters: AttendanceFilters = {
            userId: staffId,
            page: pagination.pageIndex + 1,
            limit: pagination.pageSize,
        }

        if (dateRange?.from) {
            filters.startDate = format(dateRange.from, "yyyy-MM-dd")
        }
        if (dateRange?.to) {
            filters.endDate = format(dateRange.to, "yyyy-MM-dd")
        }

        return filters
    }, [staffId, pagination, dateRange])

    // Fetch data
    const { data: staffData, isLoading: staffLoading } = useStaffById(staffId)
    const { data: attendanceData, isLoading: attendanceLoading } = useStaffAttendanceRecords(attendanceFilters)

    const staff = staffData?.data
    const attendanceRecords = attendanceData?.data?.attendances || []
    const paginationData = attendanceData?.data?.pagination

    // Calculate stats
    const stats = useMemo(() => {
        const total = paginationData?.total || 0
        const present = attendanceRecords.length
        const late = attendanceRecords.filter(record => {
            const checkInTime = new Date(record.dateIn)
            const workStartTime = new Date(checkInTime)
            workStartTime.setHours(8, 0, 0, 0) // Assuming work starts at 8 AM
            return checkInTime > workStartTime
        }).length
        const onTime = present - late

        return { total, present, late, onTime }
    }, [attendanceRecords, paginationData])

    const handleExport = () => {
        // Export attendance data to CSV
        const csvData = attendanceRecords.map(record => ({
            Date: format(new Date(record.dateIn), "yyyy-MM-dd"),
            "Check In": format(new Date(record.dateIn), "HH:mm:ss"),
            "Check Out": record.dateOut ? format(new Date(record.dateOut), "HH:mm:ss") : "N/A",
            Status: record.dateOut ? "Complete" : "Ongoing"
        }))
        
        const csvContent = [
            Object.keys(csvData[0] || {}).join(","),
            ...csvData.map(row => Object.values(row).join(","))
        ].join("\n")
        
        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.setAttribute("hidden", "")
        a.setAttribute("href", url)
        a.setAttribute("download", `${staff.fullName}_attendance.csv`)
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

    if (staffLoading) {
        return (
            <Content title="Loading..." className="space-y-6">
                <div>Loading staff information...</div>
            </Content>
        )
    }

    if (!staff) {
        return (
            <Content title="Staff Not Found" className="space-y-6">
                <div>Staff member not found.</div>
                <Button onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go Back
                </Button>
            </Content>
        )
    }

    return (
        <Content title="Staff Attendance Details" className="space-y-6">
            {/* Header with staff info and back button */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={staff.image_url ?? ""} alt={staff.fullName} />
                            <AvatarFallback>
                                {staff.fullName
                                    ?.split(" ")
                                    .map((name) => name[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2) || "??"}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-xl font-semibold">{staff.fullName}</h2>
                            <p className="text-muted-foreground">{staff.position || "N/A"}</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <DatePickerRange
                        onChange={setDateRange}
                    />
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Present Days</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">On Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.onTime}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Late</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Attendance Records Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Attendance Records</CardTitle>
                    <CardDescription>
                        Detailed attendance history for {staff.fullName}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={DashboardAttendanceColumns}
                        data={attendanceRecords}
                        loading={attendanceLoading}
                        pagination={pagination}
                        pageCount={paginationData?.totalPages || 0}
                        totalRecords={paginationData?.total || 0}
                        onPaginationChange={setPagination}
                    />
                </CardContent>
            </Card>
        </Content>
    )
}