import { PrismaClient } from '@prisma/logging-client';
import { createPrismaClient } from '@workspace/utils';

export const prisma: PrismaClient = createPrismaClient(PrismaClient, 'logging');