import { Router } from 'express';
import { body } from 'express-validator';
import {
  getCycleStatus,
  getMyAppraisal,
  getAppraisalHistory,
  submitSelfAssessment,
  getTeamAppraisals,
  submitManagerReview,
} from '../controllers/appraisalController.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';

const router = Router();

router.use(auth);

// All authenticated users
router.get('/cycle-status', getCycleStatus);
router.get('/me', getMyAppraisal);
router.get('/history', getAppraisalHistory);

router.post(
  '/self-assessment',
  [
    body('overall').isFloat({ min: 1, max: 5 }).withMessage('Overall rating must be between 1 and 5'),
    body('comments').trim().notEmpty().withMessage('Comments are required'),
  ],
  validate,
  submitSelfAssessment
);

// Team views — teamlead, manager, hr, admin
router.get('/team', authorize('teamlead', 'manager', 'hr', 'admin'), getTeamAppraisals);

router.post(
  '/:id/manager-review',
  authorize('teamlead', 'manager', 'hr', 'admin'),
  [
    body('rating').isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('feedback').trim().notEmpty().withMessage('Feedback is required'),
  ],
  validate,
  submitManagerReview
);

export default router;
