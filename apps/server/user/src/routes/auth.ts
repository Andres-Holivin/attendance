import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../config/database';
import { requireAuth } from '../middleware/auth';
import { validate } from '@workspace/utils';
import { SignUpSchema, SignInSchema } from '@workspace/validation/auth';
import { AuthService } from '../service/auth.service';
import { CloudinaryService } from '../config/cloudinary';
import { uploadSingle } from '../middleware/upload';
import { cloudinaryConfig } from '../config/cloudinary-config';

// Extend session data interface for database session storage

// Helper function to handle image upload
async function handleImageUpload(file: Express.Multer.File, existingImageUrl?: string): Promise<string> {
  // Convert buffer to base64 data URL for Cloudinary
  const base64Data = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

  // Delete old image if exists
  if (existingImageUrl) {
    try {
      // Extract public_id from existing URL
      const urlParts = existingImageUrl.split('/');
      const publicIdWithExtension = urlParts[urlParts.length - 1];
      if (publicIdWithExtension) {
        const folderPath = cloudinaryConfig.folders.PROFILE_PHOTOS;
        const publicId = `${folderPath}/${publicIdWithExtension.split('.')[0]}`;
        await CloudinaryService.deleteFile(publicId);
      }
    } catch (deleteError) {
      console.log('Failed to delete old image:', deleteError);
      // Continue with upload even if delete fails
    }
  }  // Upload new image
  const uploadResult = await CloudinaryService.uploadImage(base64Data);
  return uploadResult.secure_url;
}

// Helper function to prepare update data
async function prepareUpdateData(body: any, file?: Express.Multer.File, existingImageUrl?: string): Promise<any> {
  const { phoneNumber, password } = body;
  const updateData: any = {};

  // Handle phone number update
  if (phoneNumber !== undefined) {
    updateData.phone = phoneNumber;
  }

  // Handle password update
  if (password) {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    updateData.password = hashedPassword;
  }

  // Handle image upload to Cloudinary
  if (file) {
    updateData.image_url = await handleImageUpload(file, existingImageUrl);
  }

  return updateData;
}


const router = Router();
/**
 * POST /register
 * Register a new user
 */
router.post('/register', validate({ body: SignUpSchema }), AuthService.signUp);

/**
 * POST /login
 * Authenticate user and create session
 */
router.post('/login', validate({ body: SignInSchema }), AuthService.login);

/**
 * POST /logout
 * Destroy session and logout user
 */
router.post('/logout', requireAuth, AuthService.logout);

/**
 * GET /profile
 * Get current user profile
 */
router.get('/profile', requireAuth, (req: Request, res: Response): void => {
  res.json({
    success: true,
    message: 'Profile retrieved successfully',
    data: {
      user: req.user,
      sessionId: req.sessionID,
      sessionData: {
        loginTime: req.session.loginTime,
        userAgent: req.session.userAgent,
      },
    },
  });
});

/**
 * PUT /profile
 * Update user profile (only phone, password, and image)
 */
router.put('/profile', requireAuth, uploadSingle,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { password, confirmPassword } = req.body;
      const userId = req.user!.id;
      const file = req.file;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        res.status(404).json({
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND',
        });
        return;
      }

      // Validate password confirmation if password is being changed
      if (password && password !== confirmPassword) {
        res.status(400).json({
          success: false,
          message: 'Password confirmation does not match',
          error: 'PASSWORD_MISMATCH',
        });
        return;
      }

      // Prepare update data
      let updateData: any;
      try {
        updateData = await prepareUpdateData(req.body, file, existingUser.image_url || undefined);
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        res.status(400).json({
          success: false,
          message: 'Failed to upload image',
          error: 'IMAGE_UPLOAD_FAILED',
        });
        return;
      }

      // Check if there's any data to update
      if (Object.keys(updateData).length === 0) {
        res.status(400).json({
          success: false,
          message: 'No valid fields provided for update',
          error: 'NO_UPDATE_DATA',
        });
        return;
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          fullName: true,
          position: true,
          image_url: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      console.log(`✅ Profile updated for user ${updatedUser.email}`);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: updatedUser,
          sessionId: req.sessionID,
          updatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('💥 Profile update error:', error);

      // Handle specific Prisma errors
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        res.status(409).json({
          success: false,
          message: 'Profile data conflicts with existing user',
          error: 'CONFLICT',
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_SERVER_ERROR',
      });
    }
  }
);


/**
 * GET /me
 * Get current authenticated user info
 */
router.get('/me', requireAuth, AuthService.me);

/**
 * GET /session
 * Get current session information
 */
router.get('/session', requireAuth, AuthService.session);

/**
 * GET /sessions
 * Get all active sessions for current user
 */
router.get('/sessions', requireAuth, AuthService.sessions);

/**
 * GET /validate
 * Validate session for other services (used by attendance service)
 */
router.get('/validate', AuthService.validate);

export default router;