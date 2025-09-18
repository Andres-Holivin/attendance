import { PrismaClient } from '@prisma/logging-client';
import { createPrismaClient, type ApiLogData } from '@workspace/utils';

// Create a properly typed prisma instance
const prisma = createPrismaClient(PrismaClient, 'logging');

export const ApiLogService = {
    createLog: async (data: ApiLogData) => {
        try {
            const userInfo = data.userId ? `[User: ${data.userEmail || data.userId}]` : '[Anonymous]';
            const sessionInfo = data.sessionId ? `[Session: ${data.sessionId.substring(0, 8)}...]` : '[No Session]';

            console.log(`📝 [${data.service}] Storing API log: ${data.method} ${data.endpoint} - ${data.status} ${userInfo} ${sessionInfo}`);

            const log = await prisma.apiLogging.create({
                data: {
                    method: data.method,
                    endpoint: data.endpoint,
                    status: data.status,
                    request: data.request,
                    response: data.response,
                    ip: data.ip,
                    userAgent: data.userAgent,
                    timestamp: data.timestamp,
                    userId: data.userId,
                    userEmail: data.userEmail,
                    sessionId: data.sessionId,
                }
            });

            console.log(`✅ [${data.service}] API log stored successfully with ID: ${log.id}`);
            return log;
        } catch (error) {
            console.error(`❌ [${data.service}] Failed to store API log:`, error);
            throw error;
        }
    },

    getLogs: async (page = 1, limit = 50, filters?: {
        service?: string;
        method?: string;
        status?: number;
        userId?: string;
        userEmail?: string;
        sessionId?: string;
        startDate?: Date;
        endDate?: Date;
    }) => {
        try {
            const skip = (page - 1) * limit;
            const where: any = {};

            if (filters) {
                if (filters.method) {
                    where.method = filters.method;
                }
                if (filters.status) {
                    where.status = filters.status;
                }
                if (filters.userId) {
                    where.userId = filters.userId;
                }
                if (filters.userEmail) {
                    where.userEmail = { contains: filters.userEmail, mode: 'insensitive' };
                }
                if (filters.sessionId) {
                    where.sessionId = filters.sessionId;
                }
                if (filters.startDate || filters.endDate) {
                    where.timestamp = {};
                    if (filters.startDate) {
                        where.timestamp.gte = filters.startDate;
                    }
                    if (filters.endDate) {
                        where.timestamp.lte = filters.endDate;
                    }
                }
            }
            console.log('Retrieving API logs with filters:', { page, limit, where }, JSON.stringify(where));

            const [logs, total] = await Promise.all([
                prisma.apiLogging.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { timestamp: 'desc' }
                }),
                prisma.apiLogging.count({ where })
            ]);

            return {
                logs,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Failed to retrieve API logs:', error);
            throw error;
        }
    },
};