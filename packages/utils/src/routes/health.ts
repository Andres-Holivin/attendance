import { Router } from "express";

// Generic type for any Prisma client with $queryRaw method
type PrismaClientLike = {
    $queryRaw(query: TemplateStringsArray, ...values: any[]): Promise<any>;
};

export function createHealthRoute(prisma: PrismaClientLike, environment: string) {
    const router = Router();

    router.get('/health', async (req, res) => {
        try {
            // Check database connection
            await prisma.$queryRaw`SELECT 1`;

            res.json({
                success: true,
                message: 'Service is healthy',
                timestamp: new Date().toISOString(),
                environment: environment,
            });
        } catch (error) {
            console.error('Health check failed:', error);
            res.status(503).json({
                success: false,
                message: 'Service is unhealthy',
                error: 'DATABASE_CONNECTION_FAILED',
                timestamp: new Date().toISOString(),
            });
        }
    });

    return router;
}