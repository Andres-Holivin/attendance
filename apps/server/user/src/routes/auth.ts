import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate } from '@workspace/utils';
import { SignUpSchema, SignInSchema } from '@workspace/validation/auth';
import { AuthService } from '../service/auth.service';
import { uploadSingle } from '../middleware/upload';

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
router.get('/profile', requireAuth, AuthService.getProfile);

/**
 * PUT /profile
 * Update user profile (only phone, password, and image)
 */
router.put('/profile', requireAuth, uploadSingle, AuthService.updateProfile);


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