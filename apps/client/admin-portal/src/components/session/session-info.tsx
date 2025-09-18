import { useSession } from "@/hooks/useAuth"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { formatDistanceToNow } from 'date-fns'
export function SessionInfo() {
    const { data: sessionData, isLoading, error } = useSession()

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Current Session</CardTitle>
                    <CardDescription>Your active session information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardContent>
            </Card>
        )
    }

    if (error || !sessionData?.success || !sessionData.data) {
        return (
            <Alert variant="destructive">
                <AlertDescription>
                    Failed to load session information. You may need to log in again.
                </AlertDescription>
            </Alert>
        )
    }

    const session = sessionData.data

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Current Session</CardTitle>
                <CardDescription>Your active session information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Session ID</p>
                        <p className="text-sm font-mono">{session.sessionId}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                        <Badge variant={session.isAuthenticated ? "default" : "destructive"}>
                            {session.isAuthenticated ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                    {session.sessionMemory?.loginTime && (
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Login Time</p>
                            <p className="text-sm">
                                {formatDistanceToNow(new Date(session.sessionMemory.loginTime), { addSuffix: true })}
                            </p>
                        </div>
                    )}
                    {session.sessionDatabase?.expiresAt && (
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Expires</p>
                            <p className="text-sm">
                                {formatDistanceToNow(new Date(session.sessionDatabase.expiresAt), { addSuffix: true })}
                            </p>
                        </div>
                    )}
                    {session.sessionMemory?.userAgent && (
                        <div className="md:col-span-2">
                            <p className="text-sm font-medium text-muted-foreground">User Agent</p>
                            <p className="text-sm text-muted-foreground truncate">
                                {session.sessionMemory.userAgent}
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
