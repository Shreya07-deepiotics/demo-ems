import Employee from '../models/Employee.js';
import Leave from '../models/Leave.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';

// ─── GET /api/analytics/headcount-by-dept ────────────────────────────────────
export const getHeadcountByDept = asyncHandler(async (req, res) => {
  const data = await Employee.aggregate([
    { $match: { accountStatus: 'approved', status: { $ne: 'Inactive' } } },
    { $group: { _id: '$department', count: { $sum: 1 } } },
    { $project: { department: '$_id', count: 1, _id: 0 } },
    { $sort: { count: -1 } },
  ]);
  return sendSuccess(res, data);
});

// ─── GET /api/analytics/attrition-trend ──────────────────────────────────────
export const getAttritionTrend = asyncHandler(async (req, res) => {
  const { year = new Date().getFullYear() } = req.query;

  // Use inactive employees with joinDate in given year as proxy for attrition
  const inactive = await Employee.find({
    status: 'Inactive',
    joinDate: { $regex: `^${year}` },
  });

  const monthMap = {};
  inactive.forEach((emp) => {
    if (!emp.joinDate) return;
    const m = emp.joinDate.substring(5, 7); // MM
    monthMap[m] = (monthMap[m] || 0) + 1;
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const trend = months.map((name, i) => ({
    month: name,
    attrition: monthMap[String(i + 1).padStart(2, '0')] || 0,
  }));

  return sendSuccess(res, trend);
});

// ─── GET /api/analytics/leave-trend ──────────────────────────────────────────
export const getLeaveTrend = asyncHandler(async (req, res) => {
  const { year = new Date().getFullYear() } = req.query;

  const leaves = await Leave.find({
    status: 'approved',
    from: { $regex: `^${year}` },
  });

  const monthMap = {};
  leaves.forEach((l) => {
    if (!l.from) return;
    const m = parseInt(l.from.substring(5, 7), 10) - 1; // 0-indexed
    if (!monthMap[m]) monthMap[m] = { casual: 0, sick: 0, earned: 0 };
    if (l.type === 'Casual') monthMap[m].casual += l.days;
    else if (l.type === 'Sick') monthMap[m].sick += l.days;
    else if (l.type === 'Earned') monthMap[m].earned += l.days;
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const trend = months.map((name, i) => ({
    month: name,
    casual: monthMap[i]?.casual || 0,
    sick: monthMap[i]?.sick || 0,
    earned: monthMap[i]?.earned || 0,
  }));

  return sendSuccess(res, trend);
});

// ─── GET /api/analytics/org-stats ────────────────────────────────────────────
export const getOrgStats = asyncHandler(async (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  const [totalEmployees, activeToday, onLeaveToday, pendingApprovals] = await Promise.all([
    Employee.countDocuments({ accountStatus: 'approved', status: { $ne: 'Inactive' } }),
    Employee.countDocuments({ accountStatus: 'approved', status: 'Active' }),
    Leave.countDocuments({ status: 'approved', from: { $lte: today }, to: { $gte: today } }),
    Leave.countDocuments({ status: 'pending' }),
  ]);

  return sendSuccess(res, {
    totalEmployees,
    activeToday,
    onLeaveToday,
    pendingApprovals,
    attendancePercent: totalEmployees > 0 ? Math.round((activeToday / totalEmployees) * 100 * 10) / 10 : 0,
  });
});
