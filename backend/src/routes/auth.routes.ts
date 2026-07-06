import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as ctrl from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Too many attempts. Try again later.' } });

router.post('/signup', authLimiter, ctrl.signup);
router.post('/login', authLimiter, ctrl.login);
router.post('/logout', ctrl.logout);
router.post('/verify-email', ctrl.verifyEmail);
router.post('/forgot-password', authLimiter, ctrl.forgotPassword);
router.post('/reset-password', ctrl.resetPassword);
router.post('/google', ctrl.googleAuth);
router.get('/me', requireAuth, ctrl.me);

export default router;
