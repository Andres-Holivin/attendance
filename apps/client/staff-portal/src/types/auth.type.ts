import { User, SessionData, SessionInfo, UserSession } from "./user.type"

export interface AuthResponse {
    user?: User
    sessionId?: string
    loginTime?: string
    isAuthenticated?: boolean
    sessionData?: SessionData
}

export interface SessionResponse {
    sessionId: string
    user: User
    sessionDatabase: SessionInfo
    isAuthenticated: boolean
    sessionMemory: SessionData
}

export interface UserSessionsResponse {
    currentSessionId: string
    sessions: UserSession[]
    count: number
}

export interface RegisterData {
    email: string
    fullName: string
    password: string
    position?: string
    phone?: string
}

export interface LoginData {
    email: string
    password: string
}

export interface UpdateProfileData {
    fullName?: string
    position?: string
    phone?: string
    image_url?: string
}