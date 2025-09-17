import { useDailyAttendanceStatsWithFilters } from "@/hooks/useAttendanceWithAtoms";
import { ChartBarInteractive } from "@workspace/ui/components/custom/chart-bar-interactive";
import { ChartConfig } from "@workspace/ui/components/chart";
import { useDateRangeFilter } from "@/hooks/useDateRangeFilter";

export default function ChartBarDashboard() {

    const { data: dailyStatsData, isLoading: dailyStatsLoading } = useDailyAttendanceStatsWithFilters();
    const { dateRange } = useDateRangeFilter();
    const chartConfig = {
        totalWorkingHours: {
            label: "Total Hours",
            color: "var(--chart-1)",
        },
    } satisfies ChartConfig

    return (
        <ChartBarInteractive
            data={dailyStatsData?.data}
            chartConfig={chartConfig}
            loading={dailyStatsLoading}
            dataKey="totalWorkingHours"
            labelKey="date"
            title="Daily Working Hours Trends"
            description={`Showing data for ${dateRange.startDate} to ${dateRange.endDate}`}
        />
    );
}