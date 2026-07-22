import Employee from '../models/Employee.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/ApiResponse.js';

// ─── Scope helper ─────────────────────────────────────────────────────────────
/**
 * Returns a Mongoose filter object scoped to what the calling user is allowed
 * to see, based on their role.
 */
const buildScopeFilter = (user, extra = {}) => {
  const role = user.role;
  if (role === 'admin' || role === 'hr') return { ...extra };
  if (role === 'manager') return { manager: user._id, ...extra };
  if (role === 'teamlead') return { teamLead: user._id, ...extra };
  return { _id: user._id, ...extra }; // employee — only self
};

// ─── GET /api/employees  (hr, admin) ─────────────────────────────────────────
export const getAllEmployees = asyncHandler(async (req, res) => {
  const { department, status, role: roleFilter, page = 1, limit = 20, search } = req.query;

  const filter = {};
  if (department) filter.department = department;
  if (status) filter.status = status;
  if (roleFilter) filter.role = roleFilter;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { designation: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Employee.countDocuments(filter);
  const employees = await Employee.find(filter)
    .populate('manager', 'name email avatar')
    .populate('teamLead', 'name email avatar')
    .sort({ name: 1 })
    .skip(skip)
    .limit(Number(limit));

  return sendSuccess(res, employees, 'Employees fetched', 200, {
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
});

// ─── GET /api/employees/me ────────────────────────────────────────────────────
export const getMyProfile = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.user._id)
    .populate('manager', 'name email avatar designation')
    .populate('teamLead', 'name email avatar designation');
  return sendSuccess(res, employee);
});

// ─── GET /api/employees/team  (scoped by role) ────────────────────────────────
export const getTeam = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const filter = buildScopeFilter(req.user);
  // remove self from team list for non-admin/hr
  if (!['admin', 'hr'].includes(req.user.role)) {
    filter._id = { $ne: req.user._id };
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Employee.countDocuments(filter);
  const employees = await Employee.find(filter)
    .populate('manager', 'name email avatar')
    .populate('teamLead', 'name email avatar')
    .sort({ name: 1 })
    .skip(skip)
    .limit(Number(limit));

  return sendSuccess(res, employees, 'Team fetched', 200, {
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
});

// ─── GET /api/employees/:id  (hr, admin) ─────────────────────────────────────
export const getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id)
    .populate('manager', 'name email avatar designation')
    .populate('teamLead', 'name email avatar designation');
  if (!employee) return sendError(res, 'Employee not found', 404);
  return sendSuccess(res, employee);
});

// ─── POST /api/employees  (hr, admin) ────────────────────────────────────────
export const createEmployee = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const exists = await Employee.findOne({ email: email.toLowerCase() });
  if (exists) return sendError(res, 'Email already in use', 409);

  const employee = await Employee.create({
    ...req.body,
    email: email.toLowerCase(),
    accountStatus: 'approved',
    approvedAt: new Date(),
    registeredAt: new Date(),
  });

  return sendSuccess(res, employee, 'Employee created successfully', 201);
});

// ─── PUT /api/employees/:id  (hr, admin) ─────────────────────────────────────
export const updateEmployee = asyncHandler(async (req, res) => {
  // Never allow password update through this route
  delete req.body.password;

  const employee = await Employee.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  )
    .populate('manager', 'name email avatar')
    .populate('teamLead', 'name email avatar');

  if (!employee) return sendError(res, 'Employee not found', 404);
  return sendSuccess(res, employee, 'Employee updated successfully');
});

// ─── DELETE /api/employees/:id — soft delete via status (hr, admin) ──────────
export const deactivateEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findByIdAndUpdate(
    req.params.id,
    { $set: { status: 'Inactive' } },
    { new: true }
  );
  if (!employee) return sendError(res, 'Employee not found', 404);
  return sendSuccess(res, employee, 'Employee deactivated');
});
