import session from 'express-session';
import { PrismaSessionStore } from './prisma-session-store';
import { prisma } from '../config/database';
import { env } from '@workspace/utils';

// Create session store instance
const sessionStore = new PrismaSessionStore(prisma);

// Clean up expired sessions every hour
setInterval(() => {
    sessionStore.cleanup();
}, 60 * 60 * 1000);

export const sessionOptions = session({
    store: sessionStore,
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: env.NODE_ENV === 'production', // HTTPS only in production
        httpOnly: true, // Prevent XSS
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: env.NODE_ENV === 'production' ? "none" : "lax",
    },
    name: env.SESSION_NAME,
    proxy: env.NODE_ENV === 'production', // Trust the proxy in production
});