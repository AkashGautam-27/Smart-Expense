import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  updateProfile,
  refreshToken
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  registerValidator,
  loginValidator,
  verifyOtpValidator,
  forgotPasswordValidator,
  resetPasswordValidator
} from '../validators/auth.js';

const router = Router();

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, getMe);
router.post('/verify-otp', verifyOtpValidator, verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/forgot-password', forgotPasswordValidator, forgotPassword);
router.post('/reset-password', resetPasswordValidator, resetPassword);
router.put('/profile', authenticateToken, updateProfile);
router.post('/refresh-token', refreshToken);

export default router;
