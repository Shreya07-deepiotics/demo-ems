import { Router } from 'express';
import { body } from 'express-validator';
import {
  applyLeave,
  getMyLeaves,
  getLeaveBalance,
  getPendingApprovals,
  approveLeave,
  rejectLeave,
  getLeaveCalendar,
} from '../controllers/leaveController.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';

const router = Router();

router.use(auth);

// All authenticated users
router.post(
  '/apply',
  [
    body('type')
      .isIn(['Casual', 'Sick', 'Earned', 'Maternity', 'Paternity', 'Compensatory'])
      .withMessage('Invalid leave type'),
    body('from').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('from must be YYYY-MM-DD'),
    body('to').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('to must be YYYY-MM-DD'),
    body('days').isInt({ min: 1 }).withMessage('days must be a positive integer'),
    body('reason').trim().notEmpty().withMessage('Reason is required'),
  ],
  validate,
  applyLeave
);

router.get('/me', getMyLeaves);
router.get('/balance', getLeaveBalance);

// Approvals — scoped by role
router.get('/pending-approvals', authorize('teamlead', 'manager', 'hr', 'admin'), getPendingApprovals);
router.put('/:id/approve', authorize('teamlead', 'manager', 'hr', 'admin'), approveLeave);
router.put('/:id/reject', authorize('teamlead', 'manager', 'hr', 'admin'), rejectLeave);

// Org calendar — hr, admin
router.get('/calendar', authorize('hr', 'admin'), getLeaveCalendar);

export default router;
