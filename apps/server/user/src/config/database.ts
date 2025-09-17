import { PrismaClient } from '@prisma/user-client';
import { createPrismaClient } from '@workspace/utils';

export const prisma = createPrismaClient(PrismaClient, 'user');