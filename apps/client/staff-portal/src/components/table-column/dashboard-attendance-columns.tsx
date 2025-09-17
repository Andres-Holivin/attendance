import { AttendanceRecord } from "@/types/attendance.type";
import { ColumnDef } from "@tanstack/react-table"
import { CheckCircle, Clock, XCircle } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge";
import moment from "moment";
import { isEmployeeLate } from "@/lib/date-utils";
export const DashboardAttendanceColumns: ColumnDef<AttendanceRecord>[] = [
    {
        accessorKey: "user.fullName",
        header: "Employee Name",
        cell: ({ row }) => <div className="font-medium">{row.original.user.fullName}</div>,
    },
    {
        accessorKey: "user.position",
        header: "Position",
        cell: ({ row }) => <div className="text-muted-foreground">{row.original.user.position || 'N/A'}</div>,
    },
    {
        id: "status",
        header: "Status",
        cell: ({ row }) => getStatusBadge(row.original),
    },
    {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => moment(row.original.dateIn).format("YYYY-MM-DD"),
    },
    {
        accessorKey: "dateIn",
        header: "Check In Time",
        cell: ({ row }) => {
            const checkInTime = row.original.dateIn;
            return <div className="font-mono">{moment(checkInTime).format("HH:mm:ss")}</div>
        },
    },
    {
        accessorKey: "dateOut",
        header: "Check Out Time",
        cell: ({ row }) => {
            const checkOutTime = row.original.dateOut;
            if (!checkOutTime) {
                return <Badge variant="outline">Still Working</Badge>;
            }
            return <div className="font-mono">{moment(checkOutTime).format("HH:mm:ss")}</div>
        },
    },
    {
        id: "workingHours",
        header: "Working Hours",
        cell: ({ row }) => {
            const checkIn = new Date(row.original.dateIn);
            const checkOut = row.original.dateOut ? new Date(row.original.dateOut) : new Date();
            const diffMs = checkOut.getTime() - checkIn.getTime();
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

            return (
                <div className="font-mono">
                    {hours}h {minutes}m {!row.original.dateOut && <span className="text-muted-foreground">(ongoing)</span>}
                </div>
            );
        },
    }
]
function getStatusBadge(record: AttendanceRecord) {
    const isLate = isEmployeeLate(record.dateIn);
    const isPresent = true; // If record exists, user is present

    if (isPresent && !isLate) {
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />On Time</Badge>;
    } else if (isPresent && isLate) {
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Late</Badge>;
    } else {
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Absent</Badge>;
    }
}