"use client"
import Content from "@/components/content";
import { SessionInfo } from "@/components/session/session-info";
import { UserSessions } from "@/components/session/user-session";
export default function SessionPage() {
    return (
        <Content className="space-y-6 flex flex-col h-full justify-center items-center"
        title="Session Management">
            <SessionInfo />
            <UserSessions />
        </Content>
    )
}