import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import {
  register,
  login,
  logout,
  getMe,
  getPendingAccounts,
  approveAccount,
  rejectAccount,
} from '../controllers/authController.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';

const router = Router();

// Brute-force protection on login — max 10 attempts per 15 min per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Public ────────────────────────────────────────────────────────────────────
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role')
      .optional()
      .isIn(['employee', 'teamlead', 'manager', 'hr', 'admin'])
      .withMessage('Invalid role'),
  ],
  validate,
  register
);

router.post(
  '/login',
  loginLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.post('/logout', logout);

// ── Protected ─────────────────────────────────────────────────────────────────
router.get('/me', auth, getMe);

// ── Admin only ────────────────────────────────────────────────────────────────
router.get('/accounts/pending', auth, authorize('admin'), getPendingAccounts);
router.put('/accounts/:id/approve', auth, authorize('admin'), approveAccount);
router.put('/accounts/:id/reject', auth, authorize('admin'), rejectAccount);

export default router;
