import { Router } from 'express';
import {
  getHeadcountByDept,
  getAttritionTrend,
  getLeaveTrend,
  getOrgStats,
} from '../controllers/analyticsController.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';

const router = Router();

router.use(auth);
router.use(authorize('hr', 'admin'));

router.get('/headcount-by-dept', getHeadcountByDept);
router.get('/attrition-trend', getAttritionTrend);
router.get('/leave-trend', getLeaveTrend);
router.get('/org-stats', getOrgStats);

export default router;
