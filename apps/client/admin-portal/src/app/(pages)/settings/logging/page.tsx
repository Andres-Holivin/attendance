"use client";

import React from "react";
import { useAuthStatus } from "@/hooks/useAuth";
import { useLogs } from "@/hooks/useLogs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Activity } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { loggingColumns } from "@/components/table-column/logging-columns";
import { type ApiLogFilters } from "@/services/logging.service";
import Content from "@/components/content";
import { Loading } from "@workspace/ui/components/custom/loading";
import { FailedFetch } from "@workspace/ui/components/custom/failed-fetch";
import { LoggingFilters } from "@/components/logging/logging-filters";

const ITEMS_PER_PAGE = 10;

export default function LoggingPage() {
  const { user, isLoading: authLoading } = useAuthStatus();
  const [filters, setFilters] = React.useState<ApiLogFilters>({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: ITEMS_PER_PAGE,
  });

  const { data, error, isLoading, refetch } = useLogs(filters, pagination.pageSize, pagination.pageIndex + 1);


  if (isLoading || authLoading) { return (<Content><Loading /></Content>) }
  if (error) { return <FailedFetch message={error?.message || "Failed to load API logs."} retry={refetch} /> }

  return (
    <Content title="API Logging" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            Monitor and analyze API requests across all services
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4" />
          <span>Real-time monitoring</span>
        </div>
      </div>
      <Card >
        <CardHeader>
          <CardTitle className="text-lg">Current Session</CardTitle>
          <CardDescription>
            Viewing logs for user: <span className="font-mono">{user?.email}</span>
            {user?.id && (<span className="ml-2">(ID: <span className="font-mono">{user.id}</span>)</span>)}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Request Logs</CardTitle>
          <CardDescription>Detailed logs of all API requests with user context and session information</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={loggingColumns}
            data={data?.logs ?? []}
            loading={isLoading}
            pagination={pagination}
            pageCount={data?.pagination.totalPages ?? 0}
            totalRecords={data?.pagination.total ?? 0}
            onPaginationChange={setPagination}
          />
        </CardContent>
      </Card>
    </Content>
  );
}
