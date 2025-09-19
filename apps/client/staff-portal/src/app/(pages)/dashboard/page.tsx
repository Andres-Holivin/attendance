"use client"

import Content from "@/components/content";
import { FilterDisplay } from "@/components/dashboard/filter-display";
import { useDateRangeFilter } from "@/hooks/useDateRangeFilter";
import { DatePickerInput } from "@workspace/ui/components/date-picker-input";
import { AttendanceTable } from "@/components/dashboard/attendance-table";
import StatisticsCard from "@/components/dashboard/statistics-card";
import ChartPieDashboard from "@/components/dashboard/chart-pie-dashboard";
import ChartBarDashboard from "@/components/dashboard/chart-bar-dashboard";



export default function DashboardPage() {

  // Use custom hooks for filter management
  const { dateRange, handleStartDateChange, handleEndDateChange } = useDateRangeFilter();
  return (
    <Content className="space-y-6" title="Attendance Dashboard">
      <div className="flex items-center gap-2 flex-col md:flex-row ">
        <DatePickerInput
          value={dateRange.startDate ? new Date(dateRange.startDate) : undefined}
          onChange={handleStartDateChange}
        />
        <div> to </div>
        <DatePickerInput
          value={dateRange.endDate ? new Date(dateRange.endDate) : undefined}
          onChange={handleEndDateChange}
        />
      </div>
      <FilterDisplay />
      <StatisticsCard />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartPieDashboard/>
        <ChartBarDashboard/>
      </div>
      <AttendanceTable />
    </Content>
  )
}
