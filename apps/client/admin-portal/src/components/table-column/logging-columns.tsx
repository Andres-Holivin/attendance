import { ApiLog } from "@/services/logging.service";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Clock,  User } from "lucide-react";
import { LogDetailDialog } from "../logging/log-detail-dialog";

export const timeAgo = (date: Date): string => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
};
export const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
        case "GET": return "bg-blue-500/10 text-blue-700 border-blue-200";
        case "POST": return "bg-green-500/10 text-green-700 border-green-200";
        case "PUT": return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
        case "DELETE": return "bg-red-500/10 text-red-700 border-red-200";
        case "PATCH": return "bg-purple-500/10 text-purple-700 border-purple-200";
        default: return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
};
export const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "bg-green-500/10 text-green-700 border-green-200";
    if (status >= 300 && status < 400) return "bg-blue-500/10 text-blue-700 border-blue-200";
    if (status >= 400 && status < 500) return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
    if (status >= 500) return "bg-red-500/10 text-red-700 border-red-200";
    return "bg-gray-500/10 text-gray-700 border-gray-200";
};

export const loggingColumns: ColumnDef<ApiLog>[] = [
    {
        accessorKey: "method",
        header: "Method",
        cell: ({ row }) => {
            const method = row.original.method;
            return (
                <Badge
                    variant="outline"
                    className={cn("font-mono text-xs", getMethodColor(method))}
                >
                    {method}
                </Badge>
            );
        },
        enableSorting: true,
        enableHiding: false,
    },
    {
        accessorKey: "endpoint",
        header: "Endpoint",
        cell: ({ row }) => {
            const endpoint = row.original.endpoint;
            return (
                <div className="font-mono text-sm truncate max-w-[300px]" title={endpoint}>
                    {endpoint}
                </div>
            );
        },
        enableSorting: true,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status;
            return (
                <Badge
                    variant="outline"
                    className={cn("font-mono text-xs", getStatusColor(status))}
                >
                    {status}
                </Badge>
            );
        },
        enableSorting: true,
    },
    {
        accessorKey: "userEmail",
        header: "User",
        cell: ({ row }) => {
            const userEmail = row.original.userEmail;
            return (
                <div className="flex items-center gap-2">
                    {userEmail ? (
                        <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm truncate max-w-[120px]" title={userEmail}>
                                {userEmail}
                            </span>
                        </div>
                    ) : (
                        <span className="text-xs text-muted-foreground">Anonymous</span>
                    )}
                </div>
            );
        },
        enableSorting: true,
    },
    {
        accessorKey: "timestamp",
        header: "Time",
        cell: ({ row }) => {
            const timestamp = row.original.timestamp;
            const date = new Date(timestamp);
            return (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span title={date.toLocaleString()}>
                        {timeAgo(date)}
                    </span>
                </div>
            );
        },
        enableSorting: true,
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const log = row.original;
            return <LogDetailDialog log={log} />;
        },
        enableSorting: false,
        enableHiding: false,
    },
];