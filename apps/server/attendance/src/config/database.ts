import { PrismaClient } from '@prisma/attendance-client';
import { createPrismaClient } from '@workspace/utils';

export const prisma = createPrismaClient(PrismaClient, 'attendance');

