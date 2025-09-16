"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const database_1 = require("@/config/database");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
exports.AuthService = {
    signUp: async (req, res) => {
        try {
            const { email, fullName, password } = req.body;
            // Check if user already exists
            const existingUser = await database_1.prisma.user.findFirst({
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
            const hashedPassword = await bcryptjs_1.default.hash(password, saltRounds);
            // Create user
            await database_1.prisma.user.create({
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
        }
        catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_SERVER_ERROR',
            });
        }
    }
};
