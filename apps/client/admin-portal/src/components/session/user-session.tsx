import { useUserSessions } from "@/hooks/useAuth"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { formatDistanceToNow } from 'date-fns'
export function UserSessions() {
    const { data: sessionsData, isLoading, error } = useUserSessions()

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Active Sessions</CardTitle>
                    <CardDescription>All your active sessions across devices</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error || !sessionsData?.success || !sessionsData.data) {
        return (
            <Alert variant="destructive">
                <AlertDescription>
                    Failed to load session list. Please try again.
                </AlertDescription>
            </Alert>
        )
    }

    const sessions = sessionsData.data

    return (
        <Card className="w-full ">
            <CardHeader>
                <CardTitle>Active Sessions ({sessions.count})</CardTitle>
                <CardDescription>All your active sessions across devices</CardDescription>
            </CardHeader>
            <CardContent>
                {sessions.sessions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No active sessions found.</p>
                ) : (
                    <div className="space-y-3">
                        {sessions.sessions.map((session) => (
                            <div
                                key={session.id}
                                className="flex items-center justify-between p-3 border rounded-lg"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium">
                                            Session {session.sessionId.slice(-8)}
                                        </p>
                                        {session.sessionId === sessions.currentSessionId && (
                                            <Badge variant="secondary" className="text-xs">
                                                Current
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <span>
                                            Created {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                                        </span>
                                        <span>
                                            Expires {formatDistanceToNow(new Date(session.expiresAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
