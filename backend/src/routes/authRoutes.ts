import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  login,
  logout,
  refreshToken,
  validate,
  changePassword,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
} from '@/controllers/authController';
import { authenticate } from '@/middleware/auth';
import { authValidation, userValidation, handleValidationErrors } from '@/middleware/validation';

const router = Router();

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: {
    success: false,
    message: 'Too many password change attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post('/login', authLimiter, authValidation.login, handleValidationErrors, login);
router.post('/refresh', authLimiter, refreshToken);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

// Protected routes
router.use(authenticate); // All routes below require authentication

router.post('/logout', logout);
router.get('/validate', validate);
router.get('/profile', getProfile);
router.put('/profile', userValidation.update, handleValidationErrors, updateProfile);
router.post('/change-password', passwordLimiter, authValidation.changePassword, handleValidationErrors, changePassword);

export default router;
