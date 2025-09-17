import { ChartConfig } from "@workspace/ui/components/chart";
import { ChartPieLegend } from "@workspace/ui/components/custom/chart-pie-legend";
import { useAttendanceStatisticsWithFilters } from "@/hooks/useAttendanceWithAtoms";
import { useDateRangeFilter } from "@/hooks/useDateRangeFilter";


export default function ChartPieDashboard() {
    const { data: statisticsData, isLoading: statsLoading } = useAttendanceStatisticsWithFilters();
    const { dateRange } = useDateRangeFilter();

    const chartConfig = {
        attendance: {
            label: "Attendance",
        },
        present: {
            label: "Present",
            color: "var(--chart-1)",
        },
        absent: {
            label: "Absent",
            color: "var(--chart-2)",
        },
        late: {
            label: "Late",
            color: "var(--chart-3)",
        },
        onTime: {
            label: "On Time",
            color: "var(--chart-4)",
        },
    } satisfies ChartConfig
    const chartData = statisticsData?.data ? [
        {
            category: "present",
            count: statisticsData?.data.presentToday,
            fill: "var(--color-present)"
        },
        {
            category: "absent",
            count: statisticsData?.data.absentToday,
            fill: "var(--color-absent)"
        },
        {
            category: "late",
            count: statisticsData?.data.lateToday,
            fill: "var(--color-late)"
        },
        {
            category: "onTime",
            count: statisticsData.data.onTimeToday,
            fill: "var(--color-onTime)"
        },
    ].filter(item => item.count > 0) : [];

    return (
        <ChartPieLegend
            data={chartData}
            chartConfig={chartConfig}
            loading={statsLoading}
            dataKey="count"
            labelKey="category"
            title="Attendance Distribution"
            description={
                <div className="flex flex-col lg:flex-row gap-1">
                    <div>Employees present for</div>
                    <div>{dateRange.startDate} to {dateRange.endDate}</div>
                </div>
            }
        />
    )
}