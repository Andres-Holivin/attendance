import { Store } from 'express-session';
import { PrismaClient } from '@prisma/user-client';

export class PrismaSessionStore extends Store {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient, options: any = {}) {
        super(options);
        this.prisma = prisma;
    }

    // Get session data
    get(sid: string, callback: (err?: any, session?: any) => void): void {
        this.prisma.session
            .findUnique({
                where: { sessionId: sid },
            })
            .then((session) => {
                if (session && session.expiresAt > new Date()) {
                    try {
                        const data = JSON.parse(session.data);
                        callback(null, data);
                    } catch (err) {
                        console.error('Session parse error:', err);
                        callback(err);
                    }
                } else {
                    // Session not found or expired
                    callback(null, null);
                }
            })
            .catch((err) => {
                console.error('Session store error (get):', err);
                callback(err);
            });
    }

    // Set session data
    set(sid: string, session: any, callback?: (err?: any) => void): void {
        const expiresAt = session.cookie?.expires
            ? new Date(session.cookie.expires)
            : new Date(Date.now() + 24 * 60 * 60 * 1000); // Default to 24 hours

        const data = JSON.stringify(session);
        const userId = session.passport?.user || null; // Allow null for anonymous sessions

        this.prisma.session
            .upsert({
                where: { sessionId: sid },
                update: {
                    data,
                    expiresAt,
                    updatedAt: new Date(),
                    ...(userId && { userId }), // Only update userId if it exists
                },
                create: {
                    sessionId: sid,
                    userId,
                    data,
                    expiresAt,
                },
            })
            .then(() => {
                if (callback) callback();
            })
            .catch((err) => {
                console.error('Session store error (set):', err);
                if (callback) callback(err);
            });
    }

    // Destroy session
    destroy(sid: string, callback?: (err?: any) => void): void {
        this.prisma.session
            .deleteMany({
                where: { sessionId: sid },
            })
            .then((result) => {
                // deleteMany doesn't throw if no records found
                console.log(`Destroyed ${result.count} session(s) with ID: ${sid}`);
                if (callback) callback();
            })
            .catch((err) => {
                console.error('Session store error (destroy):', err);
                if (callback) callback(err);
            });
    }

    // Touch session (update expiry)
    touch(sid: string, session: any, callback?: (err?: any) => void): void {
        const expiresAt = session.cookie?.expires
            ? new Date(session.cookie.expires)
            : new Date(Date.now() + 24 * 60 * 60 * 1000);

        this.prisma.session
            .updateMany({
                where: { sessionId: sid },
                data: {
                    expiresAt,
                    updatedAt: new Date(),
                },
            })
            .then((result) => {
                console.log(`Touched ${result.count} session(s) with ID: ${sid}`);
                if (callback) callback();
            })
            .catch((err) => {
                console.error('Session store error (touch):', err);
                if (callback) callback(err);
            });
    }

    // Get all session IDs
    all(callback: (err?: any, sessions?: any[]) => void): void {
        this.prisma.session
            .findMany({
                where: {
                    expiresAt: {
                        gt: new Date(),
                    },
                },
                select: {
                    sessionId: true,
                    data: true,
                },
            })
            .then((sessions) => {
                const result = sessions.map((session) => {
                    try {
                        return JSON.parse(session.data);
                    } catch (err) {
                        console.error('Error parsing session data:', err);
                        return null;
                    }
                }).filter(Boolean);
                callback(null, result);
            })
            .catch((err) => {
                callback(err);
            });
    }

    // Clear all sessions
    clear(callback?: (err?: any) => void): void {
        this.prisma.session
            .deleteMany({})
            .then(() => {
                if (callback) callback();
            })
            .catch((err) => {
                if (callback) callback(err);
            });
    }

    // Get session count
    length(callback: (err?: any, length?: number) => void): void {
        this.prisma.session
            .count({
                where: {
                    expiresAt: {
                        gt: new Date(),
                    },
                },
            })
            .then((count) => {
                callback(null, count);
            })
            .catch((err) => {
                callback(err);
            });
    }

    // Clean up expired sessions
    cleanup(): void {
        this.prisma.session
            .deleteMany({
                where: {
                    expiresAt: {
                        lt: new Date(),
                    },
                },
            })
            .catch((err) => {
                console.error('Error cleaning up expired sessions:', err);
            });
    }
}