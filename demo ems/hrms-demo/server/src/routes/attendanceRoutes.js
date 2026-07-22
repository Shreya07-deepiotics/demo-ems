import { Router } from 'express';
import {
  checkIn,
  checkOut,
  getMyAttendance,
  getAttendanceSummary,
  getTeamAttendance,
  getTeamAttendanceToday,
} from '../controllers/attendanceController.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';

const router = Router();

router.use(auth);

// All authenticated users
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/me', getMyAttendance);

// Summary — anyone can see their own; hr/admin can see any
router.get('/summary/:employeeId', getAttendanceSummary);

// Team views — scoped by role
router.get('/today', authorize('teamlead', 'manager', 'hr', 'admin'), getTeamAttendanceToday);
router.get('/team', authorize('teamlead', 'manager', 'hr', 'admin'), getTeamAttendance);

export default router;
