declare global {
    var __prisma: any;
}

export function createDatabaseConfig<T>(ClientClass: new () => T): T {
    const isProduction = process.env.NODE_ENV === 'production';

    const prisma = (globalThis as any).__prisma || new ClientClass();

    if (!isProduction) {
        (globalThis as any).__prisma = prisma;
    }

    return prisma;
}