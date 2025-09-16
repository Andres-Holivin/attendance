import { prisma } from "@/config/database";
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';


export const AuthService = {
    signUp: async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, fullName, password } = req.body;

            // Check if user already exists
            const existingUser = await prisma.user.findFirst({
                where: { email: email.toLowerCase() },
            });

            if (existingUser) {
                res.status(400).json({
                    success: false,
                    message: 'User with this email already exists',
                    error: 'BAD_REQUEST',
                });
                return;
            }

            // Hash password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Create user
            await prisma.user.create({
                data: {
                    email: email.toLowerCase(),
                    password: hashedPassword,
                    fullName: fullName
                }
            });

            res.status(200).json({
                success: true,
                message: 'User registered successfully',
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_SERVER_ERROR',
            });
        }
    }

}