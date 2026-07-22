import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/ApiResponse.js';

const todayStr = () => new Date().toISOString().split('T')[0];

const timeStr = () =>
  new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });

// ─── Scope helper ─────────────────────────────────────────────────────────────
const getTeamMemberIds = async (user) => {
  const role = user.role;
  if (role === 'admin' || role === 'hr') {
    const all = await Employee.find({}, '_id');
    return all.map((e) => e._id);
  }
  if (role === 'manager') {
    const team = await Employee.find({ manager: user._id }, '_id');
    return team.map((e) => e._id);
  }
  if (role === 'teamlead') {
    const team = await Employee.find({ teamLead: user._id }, '_id');
    return team.map((e) => e._id);
  }
  return [user._id];
};

// ─── POST /api/attendance/check-in ───────────────────────────────────────────
export const checkIn = asyncHandler(async (req, res) => {
  const today = todayStr();
  const existing = await Attendance.findOne({ employee: req.user._id, date: today });
  if (existing) {
    return sendError(res, 'Already checked in today', 400);
  }

  const now = timeStr();
  // Late if check-in is after 09:30
  const [h, m] = now.split(':').map(Number);
  const isLate = h > 9 || (h === 9 && m > 30);

  const record = await Attendance.create({
    employee: req.user._id,
    date: today,
    status: isLate ? 'late' : 'present',
    checkIn: now,
  });

  return sendSuccess(res, record, 'Checked in successfully', 201);
});

// ─── POST /api/attendance/check-out ──────────────────────────────────────────
export const checkOut = asyncHandler(async (req, res) => {
  const today = todayStr();
  const record = await Attendance.findOne({ employee: req.user._id, date: today });
  if (!record) {
    return sendError(res, 'No check-in record found for today. Check in first.', 400);
  }
  if (record.checkOut) {
    return sendError(res, 'Already checked out today', 400);
  }
  record.checkOut = timeStr();
  await record.save();
  return sendSuccess(res, record, 'Checked out successfully');
});

// ─── GET /api/attendance/me?month=YYYY-MM ────────────────────────────────────
export const getMyAttendance = asyncHandler(async (req, res) => {
  const { month } = req.query; // e.g. "2025-07"
  const filter = { employee: req.user._id };
  if (month) filter.date = { $regex: `^${month}` };

  const records = await Attendance.find(filter).sort({ date: 1 });
  return sendSuccess(res, records);
});

// ─── GET /api/attendance/summary/:employeeId ─────────────────────────────────
export const getAttendanceSummary = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;
  const { month } = req.query;

  const filter = { employee: employeeId };
  if (month) filter.date = { $regex: `^${month}` };

  const records = await Attendance.find(filter);
  const summary = {
    present: records.filter((r) => r.status === 'present').length,
    absent: records.filter((r) => r.status === 'absent').length,
    late: records.filter((r) => r.status === 'late').length,
    totalWorkingDays: records.length,
  };

  return sendSuccess(res, { records, summary });
});

// ─── GET /api/attendance/team?date=YYYY-MM-DD (teamlead, manager, hr, admin) ─
export const getTeamAttendance = asyncHandler(async (req, res) => {
  const { date, month, page = 1, limit = 50 } = req.query;
  const memberIds = await getTeamMemberIds(req.user);

  const filter = { employee: { $in: memberIds } };
  if (date) filter.date = date;
  else if (month) filter.date = { $regex: `^${month}` };

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Attendance.countDocuments(filter);
  const records = await Attendance.find(filter)
    .populate('employee', 'name email avatar designation department')
    .sort({ date: -1 })
    .skip(skip)
    .limit(Number(limit));

  return sendSuccess(res, records, 'Team attendance fetched', 200, {
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
});

// ─── GET /api/attendance/today  (teamlead, manager, hr, admin) ───────────────
export const getTeamAttendanceToday = asyncHandler(async (req, res) => {
  const today = todayStr();
  const memberIds = await getTeamMemberIds(req.user);

  const records = await Attendance.find({
    employee: { $in: memberIds },
    date: today,
  }).populate('employee', 'name email avatar designation');

  // Include members with no record today (absent)
  const presentIds = new Set(records.map((r) => String(r.employee._id)));
  const allMembers = await Employee.find({ _id: { $in: memberIds } }, 'name email avatar designation');

  const result = allMembers.map((emp) => {
    const rec = records.find((r) => String(r.employee._id) === String(emp._id));
    return {
      employee: { _id: emp._id, name: emp.name, email: emp.email, avatar: emp.avatar, designation: emp.designation },
      date: today,
      status: rec ? rec.status : 'absent',
      checkIn: rec ? rec.checkIn : null,
      checkOut: rec ? rec.checkOut : null,
    };
  });

  return sendSuccess(res, result);
});
