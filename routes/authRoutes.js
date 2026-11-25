import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  getDemoAccounts,
  sendOtp,
  verifyOtp,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/demo-accounts', getDemoAccounts);

export default router;
