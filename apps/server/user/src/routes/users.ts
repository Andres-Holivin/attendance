import { Router } from 'express';
import { requireAdmin } from '../middleware/auth';
import { validate } from '@workspace/utils';
import { UserService } from '../service/user.service';
import { uploadSingle } from '../middleware/upload';
import { z } from 'zod';

// Validation schemas
const CreateUserSchema = {
    body: z.object({
        email: z.string().email(),
        fullName: z.string().min(2),
        password: z.string().min(6),
        position: z.string().optional(),
        phoneNumber: z.string().optional(),
        role: z.enum(['STAFF', 'ADMIN']).default('STAFF'),
    })
};

const UpdateUserSchema = {
    body: z.object({
        fullName: z.string().min(2).optional(),
        position: z.string().optional(),
        phoneNumber: z.string().optional(),
    })
};

const router = Router();

/**
 * GET /users
 * Get all users with pagination, search, and filtering (Admin only)
 */
router.get('/', requireAdmin, UserService.getUsers);

/**
 * GET /users/:id
 * Get a specific user by ID (Admin only)
 */
router.get('/:id', requireAdmin, UserService.getUserById);

/**
 * POST /users
 * Create a new user (Admin only)
 */
router.post('/',
    requireAdmin,
    uploadSingle,
    validate(CreateUserSchema),
    UserService.createUser
);

/**
 * PUT /users/:id
 * Update an existing user (Admin only)
 */
router.put('/:id',
    requireAdmin,
    uploadSingle,
    validate(UpdateUserSchema),
    UserService.updateUser
);

/**
 * DELETE /users/:id
 * Delete a user (Admin only)
 */
router.delete('/:id', requireAdmin, UserService.deleteUser);

export default router;