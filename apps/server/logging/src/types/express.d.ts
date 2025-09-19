// Base Express session and user type declarations
declare global {
    namespace Express {
        interface User {
            id: string;
            email: string;
            fullName: string;
            position?: string | null;
            image_url?: string | null;
            phone?: string | null;
            createdAt: Date;
            updatedAt: Date;
        }

        interface Request {
            user?: User;
            appSource?: 'admin-portal' | 'staff-portal';
        }
    }
}

// Extend session data with user service specific properties
declare module 'express-session' {
    interface SessionData {
        userId?: string;
        loginTime?: string;
        userAgent?: string;
        visitCount?: number;
        passport?: {
            user?: string;
        };
    }
}

export { };