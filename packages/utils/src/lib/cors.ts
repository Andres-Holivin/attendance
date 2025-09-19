import cors from 'cors';

export const createCorsOptions = (allowedOrigins: string[]) => {
    console.log('CORS allowed origins:', allowedOrigins);
    return cors({
        origin: "*",
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'x-app-signature'
        ]
    });
};