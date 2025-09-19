
import { CheckCircle, Clock, XCircle } from 'lucide-react'
import { useCombinedAttendanceStatsWithFilters } from "../../hooks/useAttendanceWithAtoms";
import { useDateRangeFilter } from "../../hooks/useDateRangeFilter";
import moment from 'moment';

export default function StatisticsCard() {
    const { data: combinedData } = useCombinedAttendanceStatsWithFilters();
    const { dateRange } = useDateRangeFilter();
    const statisticsData = combinedData ? { data: combinedData.data.summary } : undefined;
    
    // Determine if we're showing today's data or a date range
    const isToday = dateRange.startDate === moment().format('YYYY-MM-DD') && 
                   dateRange.endDate === moment().format('YYYY-MM-DD');
    
    const isSingleDay = dateRange.startDate === dateRange.endDate;
    
    // Create appropriate labels based on the date range
    let periodLabel: string;
    let presentLabel: string;
    let absentLabel: string;
    let lateLabel: string;
    
    if (isToday) {
        periodLabel = 'Today';
        presentLabel = 'Present Today';
        absentLabel = 'Absent Today'; 
        lateLabel = 'Late Today';
    } else if (isSingleDay) {
        periodLabel = 'Selected Day';
        presentLabel = 'Present';
        absentLabel = 'Absent';
        lateLabel = 'Late';
    } else {
        periodLabel = 'Selected Period';
        presentLabel = 'Days Present'; // For staff: days attended, for admin: users who attended
        absentLabel = 'Days Absent';   // For staff: days missed, for admin: users who never attended
        lateLabel = 'Late Instances';  // For staff: late days, for admin: total late instances
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card rounded-lg border p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                        <p className="text-2xl font-bold">{statisticsData?.data?.totalEmployees || 0}</p>
                    </div>
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                    </div>
                </div>
            </div>

            <div className="bg-card rounded-lg border p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{presentLabel}</p>
                        <p className="text-2xl font-bold text-green-600">{statisticsData?.data?.presentToday || 0}</p>
                    </div>
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                </div>
            </div>

            <div className="bg-card rounded-lg border p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{absentLabel}</p>
                        <p className="text-2xl font-bold text-red-600">{statisticsData?.data?.absentToday || 0}</p>
                    </div>
                    <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                        <XCircle className="h-4 w-4 text-red-600" />
                    </div>
                </div>
            </div>

            <div className="bg-card rounded-lg border p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{lateLabel}</p>
                        <p className="text-2xl font-bold text-yellow-600">{statisticsData?.data?.lateToday || 0}</p>
                    </div>
                    <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Clock className="h-4 w-4 text-yellow-600" />
                    </div>
                </div>
            </div>
        </div>
    )
}