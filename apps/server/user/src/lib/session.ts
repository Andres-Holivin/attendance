import session from 'express-session';
import { PrismaSessionStore } from './prisma-session-store';
import { prisma } from '../config/database';

// Create session store instance
const sessionStore = new PrismaSessionStore(prisma);

// Clean up expired sessions every hour
setInterval(() => {
    sessionStore.cleanup();
}, 60 * 60 * 1000);

export const sessionOptions = session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'your-fallback-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        httpOnly: true, // Prevent XSS
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    },
    name: 'sessionId', // Don't use default session name
});