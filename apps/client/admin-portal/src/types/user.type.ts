export interface User {
    id: string // Changed from number to string to match Prisma CUID
    email: string
    fullName: string
    position?: string | null
    image_url?: string | null
    phone?: string | null
    createdAt?: string
    updatedAt?: string
}

export interface SessionData {
    loginTime?: string
    userAgent?: string
    userId?: string
}

export interface SessionInfo {
    id: string
    sessionId: string
    userId: string
    expiresAt: string
    createdAt: string
    updatedAt: string
}

export interface UserSession {
    id: string
    sessionId: string
    expiresAt: string
    createdAt: string
    updatedAt: string
}