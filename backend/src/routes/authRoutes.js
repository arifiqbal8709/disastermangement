import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', authLimiter, AuthController.login);
router.post('/register', AuthController.register); // Explicitly returns 403 Forbidden
router.get('/verify', requireAdminAuth, AuthController.verifySession);
router.post('/logout', requireAdminAuth, AuthController.logout);

export default router;

