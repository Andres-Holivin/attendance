import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../config/database';
import { handleImageUpload, handleImageDelete } from '../lib/image-helper';

export const UserService = {
    // Get all users with pagination, search, and filtering
    getUsers: async (req: Request, res: Response): Promise<void> => {
        try {
            const {
                page = 1,
                limit = 10,
                search,
                role,
                position
            } = req.query as Record<string, string>

            const pageNum = typeof page === 'string' ? parseInt(page) : page
            const limitNum = typeof limit === 'string' ? parseInt(limit) : limit
            const offset = (pageNum - 1) * limitNum

            // Build where clause
            const where: any = {}

            if (search) {
                where.OR = [
                    { fullName: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                ]
            }

            if (role) {
                where.role = role.toUpperCase()
            }

            if (position) {
                where.position = { contains: position, mode: 'insensitive' }
            }

            // Get total count
            const total = await prisma.user.count({ where })

            // Get users
            const users = await prisma.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                    position: true,
                    image_url: true,
                    phone: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip: offset,
                take: limitNum,
            })

            const totalPages = Math.ceil(total / limitNum)

            res.json({
                success: true,
                message: 'Users retrieved successfully',
                data: {
                    users,
                    pagination: {
                        page: pageNum,
                        limit: limitNum,
                        total,
                        totalPages,
                    },
                },
            })
        } catch (error) {
            console.error('💥 Get users error:', error)
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve users',
                error: 'INTERNAL_SERVER_ERROR',
            })
        }
    },

    // Get user by ID
    getUserById: async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params

            const user = await prisma.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                    position: true,
                    image_url: true,
                    phone: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                },
            })

            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found',
                    error: 'USER_NOT_FOUND',
                })
                return
            }

            res.json({
                success: true,
                message: 'User retrieved successfully',
                data: user,
            })
        } catch (error) {
            console.error('💥 Get user error:', error)
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve user',
                error: 'INTERNAL_SERVER_ERROR',
            })
        }
    },

    // Create new user
    createUser: async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, fullName, password, position, phoneNumber, role = 'STAFF' } = req.body
            const file = req.file

            // Check if user already exists
            const existingUser = await prisma.user.findFirst({
                where: { email: email.toLowerCase() },
            })

            if (existingUser) {
                res.status(400).json({
                    success: false,
                    message: 'User with this email already exists',
                    error: 'USER_EXISTS',
                })
                return
            }

            // Hash password
            const saltRounds = 12
            const hashedPassword = await bcrypt.hash(password, saltRounds)

            // Prepare user data
            const userData: any = {
                email: email.toLowerCase(),
                password: hashedPassword,
                fullName,
                role: role.toUpperCase(),
            }

            if (position) {
                userData.position = position
            }

            if (phoneNumber) {
                userData.phone = phoneNumber
            }

            // Handle image upload
            if (file) {
                try {
                    const imageUrl = await handleImageUpload(file)
                    userData.image_url = imageUrl
                } catch (uploadError) {
                    console.error('Image upload error:', uploadError)
                    res.status(400).json({
                        success: false,
                        message: 'Failed to upload profile image',
                        error: 'IMAGE_UPLOAD_FAILED',
                    })
                    return
                }
            }

            // Create user
            const user = await prisma.user.create({
                data: userData,
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                    position: true,
                    image_url: true,
                    phone: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                }
            })

            console.log(`✅ User ${user.email} created successfully`)

            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: user,
            })
        } catch (error) {
            console.error('💥 Create user error:', error)
            res.status(500).json({
                success: false,
                message: 'Failed to create user',
                error: 'INTERNAL_SERVER_ERROR',
            })
        }
    },

    // Update user
    updateUser: async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params
            const { fullName, position, phoneNumber } = req.body
            const file = req.file

            // Check if user exists
            const existingUser = await prisma.user.findUnique({
                where: { id },
            })

            if (!existingUser) {
                res.status(404).json({
                    success: false,
                    message: 'User not found',
                    error: 'USER_NOT_FOUND',
                })
                return
            }

            // Prepare update data
            const updateData: any = {}

            if (fullName !== undefined) {
                updateData.fullName = fullName
            }

            if (position !== undefined) {
                updateData.position = position
            }

            if (phoneNumber !== undefined) {
                updateData.phone = phoneNumber
            }

            // Handle image upload
            if (file) {
                try {
                    const imageUrl = await handleImageUpload(file, existingUser.image_url || undefined)
                    updateData.image_url = imageUrl
                } catch (uploadError) {
                    console.error('Image upload error:', uploadError)
                    res.status(400).json({
                        success: false,
                        message: 'Failed to upload profile image',
                        error: 'IMAGE_UPLOAD_FAILED',
                    })
                    return
                }
            }

            // Update user
            const updatedUser = await prisma.user.update({
                where: { id },
                data: updateData,
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                    position: true,
                    image_url: true,
                    phone: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                }
            })

            console.log(`✅ User ${updatedUser.email} updated successfully`)

            res.json({
                success: true,
                message: 'User updated successfully',
                data: updatedUser,
            })
        } catch (error) {
            console.error('💥 Update user error:', error)
            res.status(500).json({
                success: false,
                message: 'Failed to update user',
                error: 'INTERNAL_SERVER_ERROR',
            })
        }
    },

    // Delete user
    deleteUser: async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params

            // Check if user exists
            const existingUser = await prisma.user.findUnique({
                where: { id },
            })

            if (!existingUser) {
                res.status(404).json({
                    success: false,
                    message: 'User not found',
                    error: 'USER_NOT_FOUND',
                })
                return
            }

            // Delete image from cloudinary if exists
            if (existingUser.image_url) {
                try {
                    await handleImageDelete(existingUser.image_url)
                } catch (error) {
                    console.warn('Failed to delete user image:', error)
                }
            }

            // Delete user
            await prisma.user.delete({
                where: { id },
            })

            console.log(`✅ User ${existingUser.email} deleted successfully`)

            res.json({
                success: true,
                message: 'User deleted successfully',
            })
        } catch (error) {
            console.error('💥 Delete user error:', error)
            res.status(500).json({
                success: false,
                message: 'Failed to delete user',
                error: 'INTERNAL_SERVER_ERROR',
            })
        }
    },
}