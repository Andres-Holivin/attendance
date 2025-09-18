import { Request, Response, NextFunction } from 'express';
import { createDefaultPubSubService } from '../services/pubsub-factory';
import { PubSubTopics } from '../services/pub-sub.service';

export interface ApiLogData {
    method: string;
    endpoint: string;
    status: number;
    request?: string;
    response?: string;
    ip?: string;
    userAgent?: string;
    service: string;
    timestamp: Date;
    userId?: string;
    userEmail?: string;
    sessionId?: string;
}

export const createApiLoggingMiddleware = (serviceName: string) => {
    // Create pub/sub service instance
    const PubsubService = createDefaultPubSubService();

    return (req: Request, res: Response, next: NextFunction) => {
        const startTime = Date.now();

        // Capture original response methods
        const originalSend = res.send;
        const originalJson = res.json;

        let responseBody: any;

        // Override res.json to capture response
        res.json = function (body) {
            responseBody = body;
            return originalJson.call(this, body);
        };

        // Override res.send to capture response
        res.send = function (body) {
            if (!responseBody) {
                responseBody = body;
            }
            return originalSend.call(this, body);
        };

        // When response finishes, log the API call
        res.on('finish', async () => {
            const endTime = Date.now();
            const duration = endTime - startTime;

            // Skip health check endpoints to avoid noise
            if (req.originalUrl.includes('/health')) {
                return;
            }

            const logData: ApiLogData = {
                method: req.method,
                endpoint: req.originalUrl,
                status: res.statusCode,
                request: JSON.stringify({
                    headers: req.headers,
                    body: req.body,
                    query: req.query,
                    params: req.params
                }),
                response: typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody),
                ip: req.ip || req.socket.remoteAddress,
                userAgent: req.get('User-Agent'),
                service: serviceName,
                timestamp: new Date(),
                // Capture user and session info if available
                userId: (req as any).user?.id,
                userEmail: (req as any).user?.email,
                sessionId: (req as any).sessionID
            };

            try {
                await PubsubService.publish(PubSubTopics.API_LOG, logData);
                const userInfo = logData.userId ? `[User: ${logData.userEmail || logData.userId}]` : '[Anonymous]';
                console.log(`📤 [${serviceName}] API log published: ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms) ${userInfo}`);
            } catch (error) {
                console.error(`❌ [${serviceName}] Failed to publish API log:`, error);
            }
        });

        next();
    };
};