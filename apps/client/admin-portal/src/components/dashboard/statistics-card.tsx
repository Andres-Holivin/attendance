
import { CheckCircle, Clock, XCircle } from 'lucide-react'
import { useCombinedAttendanceStatsWithFilters } from "../../hooks/useAttendanceWithAtoms";
export default function StatisticsCard() {
    const { data: combinedData } = useCombinedAttendanceStatsWithFilters();
    const statisticsData = combinedData ? { data: combinedData.data.summary } : undefined;
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
                        <p className="text-sm font-medium text-muted-foreground">Present Today</p>
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
                        <p className="text-sm font-medium text-muted-foreground">Absent Today</p>
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
                        <p className="text-sm font-medium text-muted-foreground">Late Today</p>
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