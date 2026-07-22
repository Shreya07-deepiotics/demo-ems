import { Router } from 'express';
import { body } from 'express-validator';
import {
  getMyPayslips,
  getPayslipById,
  getAllPayroll,
  processPayroll,
  updatePayrollStatus,
} from '../controllers/payrollController.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';

const router = Router();

router.use(auth);

// Any authenticated user — own payslips
router.get('/payslips/me', getMyPayslips);
router.get('/payslips/:id', getPayslipById);

// HR view + admin operations
router.get('/all', authorize('hr', 'admin'), getAllPayroll);

router.post(
  '/process',
  authorize('admin'),
  [
    body('month').notEmpty().withMessage('Month is required (e.g. "July 2025")'),
    body('year').isInt({ min: 2000, max: 2100 }).withMessage('Valid year is required'),
  ],
  validate,
  processPayroll
);

router.put(
  '/:id/status',
  authorize('admin'),
  [
    body('status')
      .isIn(['pending', 'processed', 'paid'])
      .withMessage('Status must be pending, processed, or paid'),
  ],
  validate,
  updatePayrollStatus
);

export default router;
