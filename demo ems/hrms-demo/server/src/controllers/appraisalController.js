import Appraisal from '../models/Appraisal.js';
import Employee from '../models/Employee.js';
import Notification from '../models/Notification.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/ApiResponse.js';

const CURRENT_CYCLE = 'Annual Appraisal 2025';
const CURRENT_YEAR = 2025;

// ─── GET /api/appraisal/cycle-status ─────────────────────────────────────────
export const getCycleStatus = asyncHandler(async (req, res) => {
  return sendSuccess(res, {
    name: CURRENT_CYCLE,
    period: 'April 2024 – March 2025',
    status: 'In Progress',
    phase: 'Manager Review Phase',
    selfRatingDue: '30 Jun 2025',
    managerReviewDue: '31 Jul 2025',
    finalDeclaration: '31 Aug 2025',
    year: CURRENT_YEAR,
  });
});

// ─── GET /api/appraisal/me ────────────────────────────────────────────────────
export const getMyAppraisal = asyncHandler(async (req, res) => {
  const appraisal = await Appraisal.findOne({
    employee: req.user._id,
    cycleName: CURRENT_CYCLE,
    year: CURRENT_YEAR,
  });
  return sendSuccess(res, appraisal);
});

// ─── GET /api/appraisal/history ───────────────────────────────────────────────
export const getAppraisalHistory = asyncHandler(async (req, res) => {
  const history = await Appraisal.find({
    employee: req.user._id,
    status: 'completed',
  }).sort({ year: -1 });
  return sendSuccess(res, history);
});

// ─── POST /api/appraisal/self-assessment ─────────────────────────────────────
export const submitSelfAssessment = asyncHandler(async (req, res) => {
  const { kpis, overall, comments } = req.body;

  let appraisal = await Appraisal.findOne({
    employee: req.user._id,
    cycleName: CURRENT_CYCLE,
    year: CURRENT_YEAR,
  });

  if (!appraisal) {
    appraisal = new Appraisal({
      employee: req.user._id,
      cycleName: CURRENT_CYCLE,
      year: CURRENT_YEAR,
    });
  }

  if (appraisal.selfAssessment?.submitted) {
    return sendError(res, 'Self-assessment already submitted for this cycle', 400);
  }

  appraisal.selfAssessment = {
    submitted: true,
    submittedOn: new Date().toISOString().split('T')[0],
    data: { kpis, overall, comments },
  };
  appraisal.status = 'self-review';
  await appraisal.save();

  return sendSuccess(res, appraisal, 'Self-assessment submitted successfully');
});

// ─── GET /api/appraisal/team  (teamlead, manager, hr, admin) ─────────────────
export const getTeamAppraisals = asyncHandler(async (req, res) => {
  const role = req.user.role;
  let employeeIds;

  if (role === 'admin' || role === 'hr') {
    const all = await Employee.find({ accountStatus: 'approved' }, '_id');
    employeeIds = all.map((e) => e._id);
  } else if (role === 'manager') {
    const team = await Employee.find({ manager: req.user._id }, '_id');
    employeeIds = team.map((e) => e._id);
  } else if (role === 'teamlead') {
    const team = await Employee.find({ teamLead: req.user._id }, '_id');
    employeeIds = team.map((e) => e._id);
  } else {
    return sendError(res, 'Not authorized to view team appraisals', 403);
  }

  const appraisals = await Appraisal.find({
    employee: { $in: employeeIds },
    cycleName: CURRENT_CYCLE,
    year: CURRENT_YEAR,
  }).populate('employee', 'name email avatar designation');

  return sendSuccess(res, appraisals);
});

// ─── POST /api/appraisal/:id/manager-review  (teamlead, manager, hr, admin) ──
export const submitManagerReview = asyncHandler(async (req, res) => {
  const { rating, feedback, kpis } = req.body;
  const appraisal = await Appraisal.findById(req.params.id).populate('employee', 'name manager teamLead');
  if (!appraisal) return sendError(res, 'Appraisal not found', 404);

  const role = req.user.role;

  // Authorization check
  if (role === 'teamlead') {
    if (String(appraisal.employee.teamLead) !== String(req.user._id)) {
      return sendError(res, 'Not authorized to review this employee', 403);
    }
  } else if (role === 'manager') {
    if (String(appraisal.employee.manager) !== String(req.user._id)) {
      return sendError(res, 'Not authorized to review this employee', 403);
    }
  }

  if (appraisal.managerReview?.submitted) {
    return sendError(res, 'Manager review already submitted', 400);
  }

  appraisal.managerReview = {
    submitted: true,
    submittedOn: new Date().toISOString().split('T')[0],
    data: { rating, feedback, kpis },
  };
  appraisal.rating = rating;
  appraisal.feedback = feedback;
  appraisal.kpis = kpis;

  // Compute grade from rating
  if (rating >= 4.5) appraisal.grade = 'Outstanding';
  else if (rating >= 4.0) appraisal.grade = 'Exceeds Expectations';
  else if (rating >= 3.5) appraisal.grade = 'Meets Expectations';
  else if (rating >= 3.0) appraisal.grade = 'Needs Improvement';
  else appraisal.grade = 'Unsatisfactory';

  appraisal.status = 'manager-review';
  await appraisal.save();

  // Notify the employee
  await Notification.create({
    user: appraisal.employee._id,
    type: 'appraisal',
    title: 'Manager Review Submitted',
    message: `Your manager has completed the review for ${CURRENT_CYCLE}. Rating: ${rating}/5.`,
  });

  return sendSuccess(res, appraisal, 'Manager review submitted');
});
