import { ApiLog } from "@/services/logging.service";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@workspace/ui/components/dialog";
import { cn } from "@workspace/ui/lib/utils";
import { Eye } from "lucide-react";
import { getMethodColor, getStatusColor } from "../table-column/logging-columns";

export function LogDetailDialog({ log }: { readonly log: ApiLog }) {
    return (
        <Dialog modal>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View details</span>
                </Button>
            </DialogTrigger>
            <DialogContent className=" overflow-auto max-h-[90vh]">
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
                    <div className="grid grid-row-2 gap-4">
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

                    <Card>
                        <CardContent>
                            <h4 className="font-semibold mb-2">Request Details</h4>
                            <pre className="text-xs bg-muted p-3 rounded overflow-x-auto max-w-fit">
                                {JSON.stringify(JSON.parse(log.request), null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <h4 className="font-semibold mb-2">Response Details</h4>
                            <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                               {JSON.stringify(JSON.parse(log.response), null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}