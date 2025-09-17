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
        }
    }
}

// Base session data interface
declare module 'express-session' {
    interface SessionData {
        passport?: {
            user?: string;
        };
    }
}

export { };