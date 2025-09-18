import { Request, Response, NextFunction } from 'express';

// Standard 404 handler for all services
export const create404Handler = () => {
    return (req: Request, res: Response) => {
        res.status(404).json({
            success: false,
            message: 'Endpoint not found',
            error: 'NOT_FOUND',
        });
    };
};

// Standard error handler for all services
export const createErrorHandler = (serviceName: string, isDevelopment: boolean = false) => {
    return (err: any, req: Request, res: Response, next: NextFunction) => {
        console.error(`[${serviceName}] Unhandled error:`, err);

        // Don't send response if headers already sent
        if (res.headersSent) {
            return next(err);
        }

        res.status(err.status || 500).json({
            success: false,
            message: err.message || 'Internal server error',
            error: err.code || 'INTERNAL_SERVER_ERROR',
            service: serviceName,
            ...(isDevelopment && { stack: err.stack }),
        });
    };
};