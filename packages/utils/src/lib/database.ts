/**
 * Creates a Prisma client instance with development mode handling
 * @param PrismaClient - The Prisma client constructor for the specific database
 * @param clientName - A unique name for the client (e.g., 'user', 'attendance')
 * @returns Configured Prisma client instance
 */
export const createPrismaClient = <T>(PrismaClient: new () => T, clientName: string): T => {
    const globalKey = `__prisma_${clientName}`;
    const prisma = (globalThis as any)[globalKey] || new PrismaClient();

    if (process.env.NODE_ENV === 'development') {
        (globalThis as any)[globalKey] = prisma;
    }

    return prisma;
};