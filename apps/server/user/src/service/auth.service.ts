import { prisma } from "../config/database";
import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import passport from "passport";
import { PubsubService, PubSubTopics } from "./pub-sub.service";
import { env } from "@workspace/utils";


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
            const user = await prisma.user.create({
                data: {
                    email: email.toLowerCase(),
                    password: hashedPassword,
                    fullName: fullName
                },
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                    position: true,
                    image_url: true,
                    phone: true,
                    createdAt: true,
                    updatedAt: true,
                }
            });
            console.log(`✅ User ${user.email} registered successfully`);
            await PubsubService.publish(PubSubTopics.USER, user);
            console.log(`📤 Published user creation event for ${user.email} to Pub/Sub`);
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
    },
    login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        passport.authenticate('local', (err: any, user: any, info: any) => {
            if (err) {
                console.error('💥 Authentication error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Authentication error',
                    error: 'INTERNAL_SERVER_ERROR',
                });
            }

            if (!user) {
                console.log('🚫 User not found or invalid credentials');
                return res.status(401).json({
                    success: false,
                    message: info?.message || 'Invalid credentials',
                    error: 'UNAUTHORIZED',
                });
            }

            req.logIn(user, (err) => {
                if (err) {
                    console.error('💥 Login error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Login error',
                        error: 'INTERNAL_SERVER_ERROR',
                    });
                }

                // Store additional session data for database tracking
                req.session.userId = user.id;
                req.session.loginTime = new Date().toISOString();
                req.session.userAgent = req.get('User-Agent') || 'Unknown';

                // Save session explicitly to ensure it's stored in database
                req.session.save((sessionErr) => {
                    if (sessionErr) {
                        console.error('💥 Session save error:', sessionErr);
                        // Don't fail the login if session save fails
                    }

                    console.log(`✅ User ${user.email} logged in successfully with session ${req.sessionID}`);

                    res.json({
                        success: true,
                        message: 'Login successful',
                        data: {
                            user: {
                                id: user.id,
                                email: user.email,
                                fullName: user.fullName,
                                position: user.position,
                                image_url: user.image_url,
                                phone: user.phone,
                            },
                            sessionId: req.sessionID,
                            loginTime: req.session.loginTime,
                        },
                    });
                });
            });
        })(req, res, next);
    },
    logout: (req: Request, res: Response): void => {
        if (!req.isAuthenticated()) {
            res.status(401).json({
                success: false,
                message: 'Not authenticated',
                error: 'UNAUTHORIZED',
            });
            return;
        }

        const sessionId = req.sessionID;
        const userId = req.user?.id;

        console.log(`🚪 User ${req.user?.email} logging out, destroying session ${sessionId}`);

        req.logout((err) => {
            if (err) {
                console.error('💥 Logout error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Logout error',
                    error: 'INTERNAL_SERVER_ERROR',
                });
            }

            // Destroy session in database and memory
            req.session.destroy(async (err) => {
                if (err) {
                    console.error('💥 Session destruction error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Session destruction error',
                        error: 'INTERNAL_SERVER_ERROR',
                    });
                }

                try {
                    // Explicitly remove session from database
                    await prisma.session.deleteMany({
                        where: {
                            sessionId: sessionId,
                        },
                    });

                    console.log(`✅ Session ${sessionId} successfully removed from database`);
                } catch (dbError) {
                    console.error('💥 Database session cleanup error:', dbError);
                    // Don't fail the logout if database cleanup fails
                }

                // Clear session cookie
                res.clearCookie('sessionId', {
                    path: '/',
                    httpOnly: true,
                    secure: env.NODE_ENV === 'production',
                    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
                });

                res.json({
                    success: true,
                    message: 'Logout successful',
                    data: {
                        sessionId: sessionId,
                        logoutTime: new Date().toISOString(),
                    },
                });
            });
        });
    },
    me: (req: Request, res: Response): void => {
        res.json({
            success: true,
            message: 'User info retrieved successfully',
            data: {
                user: req.user,
                sessionId: req.sessionID,
                isAuthenticated: req.isAuthenticated(),
            },
        });
    },
    session: async (req: Request, res: Response): Promise<void> => {
        try {
            // Get session from database
            const sessionData = await prisma.session.findUnique({
                where: { sessionId: req.sessionID },
                select: {
                    id: true,
                    sessionId: true,
                    userId: true,
                    expiresAt: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

            res.json({
                success: true,
                message: 'Session info retrieved successfully',
                data: {
                    sessionId: req.sessionID,
                    user: req.user,
                    sessionDatabase: sessionData,
                    isAuthenticated: req.isAuthenticated(),
                    sessionMemory: {
                        loginTime: req.session.loginTime,
                        userAgent: req.session.userAgent,
                        userId: req.session.userId,
                    },
                },
            });
        } catch (error) {
            console.error('💥 Session retrieval error:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving session information',
                error: 'INTERNAL_SERVER_ERROR',
            });
        }
    },
    sessions: async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user!.id;

            const userSessions = await prisma.session.findMany({
                where: {
                    userId: userId,
                    expiresAt: {
                        gt: new Date(), // Only active sessions
                    },
                },
                select: {
                    id: true,
                    sessionId: true,
                    expiresAt: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy: {
                    updatedAt: 'desc',
                },
            });

            res.json({
                success: true,
                message: 'User sessions retrieved successfully',
                data: {
                    currentSessionId: req.sessionID,
                    sessions: userSessions,
                    count: userSessions.length,
                },
            });
        } catch (error) {
            console.error('💥 Sessions retrieval error:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving user sessions',
                error: 'INTERNAL_SERVER_ERROR',
            });
        }
    },
    validate: async (req: Request, res: Response): Promise<void> => {
        try {
            // Check if user is authenticated
            if (!req.isAuthenticated() || !req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Session is not valid or expired',
                    error: 'UNAUTHORIZED'
                });
                return;
            }

            // Return user data for the attendance service
            res.json({
                success: true,
                message: 'Session is valid',
                user: {
                    id: req.user.id,
                    email: req.user.email,
                    fullName: req.user.fullName,
                    position: req.user.position,
                    image_url: req.user.image_url,
                    phone: req.user.phone
                },
                sessionData: {
                    sessionId: req.sessionID,
                    loginTime: req.session.loginTime,
                    userAgent: req.session.userAgent,
                }
            });
        } catch (error) {
            console.error('Session validation error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during session validation',
                error: 'INTERNAL_SERVER_ERROR'
            });
        }
    }
}