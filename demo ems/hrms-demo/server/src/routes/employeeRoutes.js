import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllEmployees,
  getMyProfile,
  getTeam,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deactivateEmployee,
} from '../controllers/employeeController.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';

const router = Router();

// All employee routes require authentication
router.use(auth);

// Self profile — any authenticated user
router.get('/me', getMyProfile);

// Team view — teamlead, manager, hr, admin
router.get('/team', authorize('teamlead', 'manager', 'hr', 'admin'), getTeam);

// Full directory — hr, admin
router.get('/', authorize('hr', 'admin'), getAllEmployees);

router.get('/:id', authorize('hr', 'admin'), getEmployeeById);

router.post(
  '/',
  authorize('hr', 'admin'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role')
      .isIn(['employee', 'teamlead', 'manager', 'hr', 'admin'])
      .withMessage('Invalid role'),
  ],
  validate,
  createEmployee
);

router.put('/:id', authorize('hr', 'admin'), updateEmployee);

// Soft delete (deactivate) — hr, admin
router.delete('/:id', authorize('hr', 'admin'), deactivateEmployee);

export default router;
