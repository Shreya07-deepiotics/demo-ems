import Employee from '../models/Employee.js';
import generateToken from '../utils/generateToken.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/ApiResponse.js';

// ─── Helper ───────────────────────────────────────────────────────────────────
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// ─── POST /api/auth/register ──────────────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, department, designation, phone } = req.body;

  const exists = await Employee.findOne({ email: email.toLowerCase() });
  if (exists) {
    return sendError(res, 'An account with this email already exists.', 409);
  }

  const initials = name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const employee = await Employee.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    role: role || 'employee',
    department: department || '',
    designation: designation || '',
    phone: phone || '',
    avatar: initials,
    accountStatus: 'pending',
    registeredAt: new Date(),
    approvalDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  return sendSuccess(
    res,
    {
      id: employee._id,
      name: employee.name,
      email: employee.email,
      accountStatus: employee.accountStatus,
      approvalDeadline: employee.approvalDeadline,
    },
    'Registration successful. Your account is pending admin approval.',
    201
  );
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Fetch with password (select: false by default)
  const employee = await Employee.findOne({ email: email.toLowerCase() }).select('+password');
  if (!employee) {
    return sendError(res, 'Invalid email or password.', 401);
  }

  const isMatch = await employee.matchPassword(password);
  if (!isMatch) {
    return sendError(res, 'Invalid email or password.', 401);
  }

  // Account status checks — match frontend UX exactly
  if (employee.accountStatus === 'pending') {
    return sendError(res, 'pending', 403, [
      {
        field: 'accountStatus',
        message: 'Your account is pending admin approval.',
        account: {
          id: employee._id,
          name: employee.name,
          email: employee.email,
          approvalDeadline: employee.approvalDeadline,
        },
      },
    ]);
  }

  if (employee.accountStatus === 'rejected') {
    return sendError(
      res,
      'Your registration was rejected by the admin. Contact HR for help.',
      403
    );
  }

  const token = generateToken(employee);

  // Set httpOnly cookie AND return token in body — supports both auth strategies
  res.cookie('token', token, cookieOptions);

  const userPayload = employee.toJSON(); // password already removed by toJSON transform
  delete userPayload.password;

  return sendSuccess(res, { token, user: userPayload }, 'Login successful');
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  return sendSuccess(res, null, 'Logged out successfully');
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
  const user = await Employee.findById(req.user._id)
    .populate('manager', 'name email avatar designation')
    .populate('teamLead', 'name email avatar designation');
  return sendSuccess(res, user);
});

// ─── GET /api/auth/accounts/pending  (admin only) ────────────────────────────
export const getPendingAccounts = asyncHandler(async (req, res) => {
  const pending = await Employee.find({ accountStatus: 'pending' }).sort({ registeredAt: -1 });
  return sendSuccess(res, pending);
});

// ─── PUT /api/auth/accounts/:id/approve  (admin only) ────────────────────────
export const approveAccount = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) return sendError(res, 'Employee not found', 404);
  if (employee.accountStatus !== 'pending') {
    return sendError(res, 'Account is not in pending state', 400);
  }
  employee.accountStatus = 'approved';
  employee.approvedAt = new Date();
  await employee.save();
  return sendSuccess(res, employee, 'Account approved successfully');
});

// ─── PUT /api/auth/accounts/:id/reject  (admin only) ─────────────────────────
export const rejectAccount = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) return sendError(res, 'Employee not found', 404);
  if (employee.accountStatus !== 'pending') {
    return sendError(res, 'Account is not in pending state', 400);
  }
  employee.accountStatus = 'rejected';
  await employee.save();
  return sendSuccess(res, employee, 'Account rejected');
});
