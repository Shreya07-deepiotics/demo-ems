import Leave from '../models/Leave.js';
import Employee from '../models/Employee.js';
import Notification from '../models/Notification.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/ApiResponse.js';

// ─── Scope helper: which employees can this user approve for? ────────────────
const getApprovableEmployeeIds = async (user) => {
  const role = user.role;
  if (role === 'admin' || role === 'hr') return null; // no filter — all
  if (role === 'manager') {
    const emp = await Employee.find({ manager: user._id }, '_id');
    return emp.map((e) => e._id);
  }
  if (role === 'teamlead') {
    const emp = await Employee.find({ teamLead: user._id }, '_id');
    return emp.map((e) => e._id);
  }
  return [];
};

// ─── POST /api/leave/apply ────────────────────────────────────────────────────
export const applyLeave = asyncHandler(async (req, res) => {
  const { type, from, to, days, reason } = req.body;

  // Determine which level handles first approval
  const employee = await Employee.findById(req.user._id)
    .populate('teamLead', '_id name')
    .populate('manager', '_id name');

  const level = employee.teamLead ? 'teamlead' : 'manager';

  const leave = await Leave.create({
    employee: req.user._id,
    type,
    from,
    to,
    days: Number(days),
    reason,
    appliedOn: new Date().toISOString().split('T')[0],
    level,
  });

  // Notify the approver
  const approverId = level === 'teamlead' ? employee.teamLead?._id : employee.manager?._id;
  if (approverId) {
    await Notification.create({
      user: approverId,
      type: 'leave',
      title: 'New Leave Request',
      message: `${req.user.name} has applied for ${type} leave from ${from} to ${to}. Action required.`,
    });
  }

  return sendSuccess(res, leave, 'Leave applied successfully', 201);
});

// ─── GET /api/leave/me ────────────────────────────────────────────────────────
export const getMyLeaves = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = { employee: req.user._id };
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Leave.countDocuments(filter);
  const leaves = await Leave.find(filter)
    .populate('approvedBy', 'name email avatar')
    .sort({ appliedOn: -1 })
    .skip(skip)
    .limit(Number(limit));

  return sendSuccess(res, leaves, 'Leave history fetched', 200, {
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
});

// ─── GET /api/leave/balance ───────────────────────────────────────────────────
export const getLeaveBalance = asyncHandler(async (req, res) => {
  const year = new Date().getFullYear();
  // Count approved leaves per type in current year
  const approved = await Leave.find({
    employee: req.user._id,
    status: 'approved',
    from: { $regex: `^${year}` },
  });

  const used = { Casual: 0, Sick: 0, Earned: 0, Maternity: 0, Paternity: 0, Compensatory: 0 };
  approved.forEach((l) => { used[l.type] = (used[l.type] || 0) + l.days; });

  const balance = {
    casual: { total: 12, used: used.Casual, remaining: Math.max(0, 12 - used.Casual) },
    sick: { total: 10, used: used.Sick, remaining: Math.max(0, 10 - used.Sick) },
    earned: { total: 15, used: used.Earned, remaining: Math.max(0, 15 - used.Earned) },
    maternity: { total: 180, used: used.Maternity, remaining: Math.max(0, 180 - used.Maternity) },
    paternity: { total: 15, used: used.Paternity, remaining: Math.max(0, 15 - used.Paternity) },
    compensatory: { total: 5, used: used.Compensatory, remaining: Math.max(0, 5 - used.Compensatory) },
  };

  return sendSuccess(res, balance);
});

// ─── GET /api/leave/pending-approvals (scoped by role) ───────────────────────
export const getPendingApprovals = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const role = req.user.role;

  let filter = { status: 'pending' };

  if (role === 'teamlead') {
    const empIds = await getApprovableEmployeeIds(req.user);
    filter.employee = { $in: empIds };
    filter.level = 'teamlead';
  } else if (role === 'manager') {
    const empIds = await getApprovableEmployeeIds(req.user);
    filter.employee = { $in: empIds };
    filter.level = 'manager';
  }
  // hr and admin: no extra filter — see all pending

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Leave.countDocuments(filter);
  const leaves = await Leave.find(filter)
    .populate('employee', 'name email avatar designation department')
    .populate('approvedBy', 'name email avatar')
    .sort({ appliedOn: -1 })
    .skip(skip)
    .limit(Number(limit));

  return sendSuccess(res, leaves, 'Pending approvals fetched', 200, {
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
});

// ─── PUT /api/leave/:id/approve ───────────────────────────────────────────────
export const approveLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id).populate('employee', 'name email teamLead manager');
  if (!leave) return sendError(res, 'Leave request not found', 404);
  if (leave.status !== 'pending') return sendError(res, 'Leave is no longer pending', 400);

  const role = req.user.role;

  // Authorization check — can this user approve this leave?
  if (role === 'teamlead') {
    const emp = await Employee.findById(leave.employee._id);
    if (String(emp.teamLead) !== String(req.user._id)) {
      return sendError(res, 'You can only approve leaves for your direct team members', 403);
    }
    if (leave.level !== 'teamlead') {
      return sendError(res, 'This leave requires manager-level approval', 403);
    }
  } else if (role === 'manager') {
    const emp = await Employee.findById(leave.employee._id);
    if (String(emp.manager) !== String(req.user._id)) {
      return sendError(res, 'You can only approve leaves for your direct reports', 403);
    }
  }
  // hr / admin — no restriction

  leave.status = 'approved';
  leave.approvedBy = req.user._id;
  await leave.save();

  // Notify the employee
  await Notification.create({
    user: leave.employee._id,
    type: 'leave',
    title: 'Leave Approved',
    message: `Your ${leave.type} leave from ${leave.from} to ${leave.to} has been approved by ${req.user.name}.`,
  });

  return sendSuccess(res, leave, 'Leave approved');
});

// ─── PUT /api/leave/:id/reject ────────────────────────────────────────────────
export const rejectLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id).populate('employee', 'name email');
  if (!leave) return sendError(res, 'Leave request not found', 404);
  if (leave.status !== 'pending') return sendError(res, 'Leave is no longer pending', 400);

  const role = req.user.role;

  if (role === 'teamlead') {
    const emp = await Employee.findById(leave.employee._id);
    if (String(emp.teamLead) !== String(req.user._id)) {
      return sendError(res, 'You can only reject leaves for your direct team members', 403);
    }
  } else if (role === 'manager') {
    const emp = await Employee.findById(leave.employee._id);
    if (String(emp.manager) !== String(req.user._id)) {
      return sendError(res, 'You can only reject leaves for your direct reports', 403);
    }
  }

  leave.status = 'rejected';
  leave.approvedBy = req.user._id;
  leave.rejectionReason = req.body.reason || '';
  await leave.save();

  // Notify the employee
  await Notification.create({
    user: leave.employee._id,
    type: 'leave',
    title: 'Leave Rejected',
    message: `Your ${leave.type} leave from ${leave.from} to ${leave.to} was rejected by ${req.user.name}.${leave.rejectionReason ? ' Reason: ' + leave.rejectionReason : ''}`,
  });

  return sendSuccess(res, leave, 'Leave rejected');
});

// ─── GET /api/leave/calendar  (hr, admin) ────────────────────────────────────
export const getLeaveCalendar = asyncHandler(async (req, res) => {
  const { month, year } = req.query; // e.g. month=07&year=2025
  const filter = { status: 'approved' };
  if (year && month) {
    const pad = String(month).padStart(2, '0');
    filter.from = { $regex: `^${year}-${pad}` };
  } else if (year) {
    filter.from = { $regex: `^${year}` };
  }

  const leaves = await Leave.find(filter)
    .populate('employee', 'name avatar')
    .sort({ from: 1 });

  return sendSuccess(res, leaves);
});
