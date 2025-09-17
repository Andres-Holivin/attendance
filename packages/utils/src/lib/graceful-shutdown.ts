// Generic type for any Prisma client with disconnect method
type PrismaClientLike = {
    $disconnect(): Promise<void>;
};

export const createGracefulShutdown = (prisma: PrismaClientLike) => {
    return async () => {
        console.log('Shutting down gracefully...');

        try {
            await prisma.$disconnect();
            console.log('Database connection closed.');
        } catch (error) {
            console.error('Error during graceful shutdown:', error);
        }

        process.exit(0);
    };
};