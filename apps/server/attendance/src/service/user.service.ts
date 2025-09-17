import { Prisma } from "@prisma/attendance-client";
import { prisma } from "../config/database";

export const UserService = {
    upsertUser: async (data: Prisma.UserCreateInput) => {
        try {
            console.log('Upserting user with data:', data);
            await prisma.user.upsert({
                where: { id: data.id },
                update: data,
                create: data,
            })
        } catch (error) {
            console.error('Error creating user:', error);
            throw new Error('Failed to create user');
        }
    }
}