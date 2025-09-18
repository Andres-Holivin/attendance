"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Eye, User, Clock, Globe } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { ApiLog } from "@/services/logging.service";

// Simple time ago function
const timeAgo = (date: Date): string => {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

interface LoggingTableProps {
  readonly logs: ApiLog[];
  readonly loading?: boolean;
}

const getStatusColor = (status: number) => {
  if (status >= 200 && status < 300) return "bg-green-500/10 text-green-700 border-green-200";
  if (status >= 300 && status < 400) return "bg-blue-500/10 text-blue-700 border-blue-200";
  if (status >= 400 && status < 500) return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
  if (status >= 500) return "bg-red-500/10 text-red-700 border-red-200";
  return "bg-gray-500/10 text-gray-700 border-gray-200";
};

const getMethodColor = (method: string) => {
  switch (method.toUpperCase()) {
    case "GET": return "bg-blue-500/10 text-blue-700 border-blue-200";
    case "POST": return "bg-green-500/10 text-green-700 border-green-200";
    case "PUT": return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
    case "DELETE": return "bg-red-500/10 text-red-700 border-red-200";
    case "PATCH": return "bg-purple-500/10 text-purple-700 border-purple-200";
    default: return "bg-gray-500/10 text-gray-700 border-gray-200";
  }
};

export function LoggingTable({ logs, loading }: LoggingTableProps) {
  if (loading) {
    const loadingItems = Array.from({ length: 5 }, (_, index) => `loading-skeleton-${index}`);
    return (
      <div className="space-y-3">
        {loadingItems.map((loadingKey) => (
          <div key={loadingKey} className="h-12 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Globe className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">No API logs found</h3>
          <p className="text-sm text-muted-foreground/70">
            Try adjusting your filters or date range
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">Method</TableHead>
            <TableHead className="min-w-[200px]">Endpoint</TableHead>
            <TableHead className="w-20">Status</TableHead>
            <TableHead className="w-40">User</TableHead>
            <TableHead className="w-32">Time</TableHead>
            <TableHead className="w-28">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn("font-mono text-xs", getMethodColor(log.method))}
                >
                  {log.method}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="font-mono text-sm truncate max-w-[300px]" title={log.endpoint}>
                  {log.endpoint}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn("font-mono text-xs", getStatusColor(log.status))}
                >
                  {log.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {log.userEmail ? (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm truncate max-w-[120px]" title={log.userEmail}>
                        {log.userEmail}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Anonymous</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span title={new Date(log.timestamp).toLocaleString()}>
                    {timeAgo(new Date(log.timestamp))}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View details</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Badge className={cn("font-mono", getMethodColor(log.method))}>
                          {log.method}
                        </Badge>
                        <span className="font-mono">{log.endpoint}</span>
                        <Badge className={cn("font-mono", getStatusColor(log.status))}>
                          {log.status}
                        </Badge>
                      </DialogTitle>
                      <DialogDescription>
                        API request details from {new Date(log.timestamp).toLocaleString()}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                      {/* Request Info */}
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <h4 className="font-semibold mb-2">Request Info</h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium">IP:</span> {log.ip || "N/A"}
                              </div>
                              <div>
                                <span className="font-medium">User Agent:</span>
                                <div className="text-xs text-muted-foreground mt-1 break-all">
                                  {log.userAgent || "N/A"}
                                </div>
                              </div>
                              {log.sessionId && (
                                <div>
                                  <span className="font-medium">Session:</span>
                                  <div className="font-mono text-xs">
                                    {log.sessionId.substring(0, 16)}...
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <h4 className="font-semibold mb-2">User Info</h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium">User ID:</span> {log.userId || "Anonymous"}
                              </div>
                              <div>
                                <span className="font-medium">Email:</span> {log.userEmail || "N/A"}
                              </div>
                              <div>
                                <span className="font-medium">Timestamp:</span>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(log.timestamp).toISOString()}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Request Details */}
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">Request Details</h4>
                          <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                            {JSON.stringify(log.request, null, 2)}
                          </pre>
                        </CardContent>
                      </Card>

                      {/* Response Details */}
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">Response Details</h4>
                          <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                            {JSON.stringify(log.response, null, 2)}
                          </pre>
                        </CardContent>
                      </Card>
                    </div>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}