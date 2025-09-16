// import { Router } from 'express';
// import { prisma } from '../config/database';
// import { requireAuth } from '../middleware/auth';

// const router = Router();

// /**
//  * GET /users
//  * Get all users (Admin only)
//  */
// router.get('/users', requireAuth, async (req, res): Promise<void> => {
//   try {
//     const { page = 1, limit = 10, search, role } = req.query;

//     const pageNum = parseInt(page as string);
//     const limitNum = parseInt(limit as string);
//     const skip = (pageNum - 1) * limitNum;

//     const where = {
//       ...(search && {
//         OR: [
//           { email: { contains: search as string, mode: 'insensitive' } },
//           { username: { contains: search as string, mode: 'insensitive' } },
//           { firstName: { contains: search as string, mode: 'insensitive' } },
//           { lastName: { contains: search as string, mode: 'insensitive' } },
//         ],
//       }),
//       ...(role && { role: role as any }),
//     };

//     const [users, total] = await Promise.all([
//       prisma.user.findMany({
//         where,
//         select: {
//           id: true,
//           email: true,
//           username: true,
//           firstName: true,
//           lastName: true,
//           role: true,
//           isActive: true,
//           createdAt: true,
//           updatedAt: true,
//         },
//         skip,
//         take: limitNum,
//         orderBy: { createdAt: 'desc' },
//       }),
//       prisma.user.count({ where }),
//     ]);

//     res.json({
//       success: true,
//       data: {
//         users,
//         pagination: {
//           page: pageNum,
//           limit: limitNum,
//           total,
//           totalPages: Math.ceil(total / limitNum),
//         },
//       },
//     });
//   } catch (error) {
//     console.error('Get users error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'INTERNAL_SERVER_ERROR',
//     });
//   }
// });

// /**
//  * GET /users/:id
//  * Get user by ID (Admin only)
//  */
// router.get('/users/:id', requireAdmin, async (req, res): Promise<void> => {
//   try {
//     const { id } = req.params;

//     const user = await prisma.user.findUnique({
//       where: { id },
//       select: {
//         id: true,
//         email: true,
//         username: true,
//         firstName: true,
//         lastName: true,
//         role: true,
//         isActive: true,
//         createdAt: true,
//         updatedAt: true,
//         _count: {
//           select: {
//             sessions: true,
//           },
//         },
//       },
//     });

//     if (!user) {
//       res.status(404).json({
//         success: false,
//         message: 'User not found',
//         error: 'NOT_FOUND',
//       });
//       return;
//     }

//     res.json({
//       success: true,
//       data: { user },
//     });
//   } catch (error) {
//     console.error('Get user error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'INTERNAL_SERVER_ERROR',
//     });
//   }
// });

// /**
//  * PUT /users/:id/status
//  * Update user status (activate/deactivate) - Admin only
//  */
// router.put('/users/:id/status', requireAdmin, async (req, res): Promise<void> => {
//   try {
//     const { id } = req.params;
//     const { isActive } = req.body;

//     if (typeof isActive !== 'boolean') {
//       res.status(400).json({
//         success: false,
//         message: 'isActive must be a boolean value',
//         error: 'VALIDATION_ERROR',
//       });
//       return;
//     }

//     // Prevent admin from deactivating themselves
//     if (req.user!.id === id && !isActive) {
//       res.status(400).json({
//         success: false,
//         message: 'Cannot deactivate your own account',
//         error: 'INVALID_OPERATION',
//       });
//       return;
//     }

//     const user = await prisma.user.update({
//       where: { id },
//       data: { isActive },
//       select: {
//         id: true,
//         email: true,
//         username: true,
//         firstName: true,
//         lastName: true,
//         role: true,
//         isActive: true,
//         updatedAt: true,
//       },
//     });

//     res.json({
//       success: true,
//       message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
//       data: { user },
//     });
//   } catch (error) {
//     console.error('Update user status error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'INTERNAL_SERVER_ERROR',
//     });
//   }
// });

// /**
//  * PUT /users/:id/role
//  * Update user role - Admin only
//  */
// router.put('/users/:id/role', requireAdmin, async (req, res): Promise<void> => {
//   try {
//     const { id } = req.params;
//     const { role } = req.body;

//     if (!['USER', 'ADMIN', 'MODERATOR'].includes(role)) {
//       res.status(400).json({
//         success: false,
//         message: 'Invalid role. Must be USER, ADMIN, or MODERATOR',
//         error: 'VALIDATION_ERROR',
//       });
//       return;
//     }

//     // Prevent admin from removing their own admin role
//     if (req.user!.id === id && req.user!.role === 'ADMIN' && role !== 'ADMIN') {
//       res.status(400).json({
//         success: false,
//         message: 'Cannot remove admin role from your own account',
//         error: 'INVALID_OPERATION',
//       });
//       return;
//     }

//     const user = await prisma.user.update({
//       where: { id },
//       data: { role },
//       select: {
//         id: true,
//         email: true,
//         username: true,
//         firstName: true,
//         lastName: true,
//         role: true,
//         isActive: true,
//         updatedAt: true,
//       },
//     });

//     res.json({
//       success: true,
//       message: 'User role updated successfully',
//       data: { user },
//     });
//   } catch (error) {
//     console.error('Update user role error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'INTERNAL_SERVER_ERROR',
//     });
//   }
// });

// /**
//  * DELETE /users/:id
//  * Delete user - Admin only
//  */
// router.delete('/users/:id', requireAdmin, async (req, res): Promise<void> => {
//   try {
//     const { id } = req.params;

//     // Prevent admin from deleting themselves
//     if (req.user!.id === id) {
//       res.status(400).json({
//         success: false,
//         message: 'Cannot delete your own account',
//         error: 'INVALID_OPERATION',
//       });
//       return;
//     }

//     await prisma.user.delete({
//       where: { id },
//     });

//     res.json({
//       success: true,
//       message: 'User deleted successfully',
//     });
//   } catch (error) {
//     console.error('Delete user error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'INTERNAL_SERVER_ERROR',
//     });
//   }
// });

// export default router;