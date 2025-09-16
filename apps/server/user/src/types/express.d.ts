// Type declarations for Express session and user
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
        }
    }
}

// Extend session data
declare module 'express-session' {
    interface SessionData {
        passport?: {
            user?: string;
        };
    }
}

export { };