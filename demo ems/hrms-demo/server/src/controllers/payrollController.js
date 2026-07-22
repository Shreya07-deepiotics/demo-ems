import Payroll from '../models/Payroll.js';
import Employee from '../models/Employee.js';
import Notification from '../models/Notification.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/ApiResponse.js';

// ─── GET /api/payroll/payslips/me ─────────────────────────────────────────────
export const getMyPayslips = asyncHandler(async (req, res) => {
  const { year, page = 1, limit = 12 } = req.query;
  const filter = { employee: req.user._id };
  if (year) filter.year = Number(year);

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Payroll.countDocuments(filter);
  const payslips = await Payroll.find(filter)
    .sort({ year: -1, createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  return sendSuccess(res, payslips, 'Payslips fetched', 200, {
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
});

// ─── GET /api/payroll/payslips/:id ────────────────────────────────────────────
export const getPayslipById = asyncHandler(async (req, res) => {
  const payslip = await Payroll.findById(req.params.id).populate(
    'employee',
    'name email avatar designation department joinDate'
  );
  if (!payslip) return sendError(res, 'Payslip not found', 404);

  // Employees can only see their own payslips
  if (
    req.user.role === 'employee' &&
    String(payslip.employee._id) !== String(req.user._id)
  ) {
    return sendError(res, 'Not authorized to view this payslip', 403);
  }

  return sendSuccess(res, payslip);
});

// ─── GET /api/payroll/all  (hr view, admin process) ──────────────────────────
export const getAllPayroll = asyncHandler(async (req, res) => {
  const { month, year, status, department, page = 1, limit = 20 } = req.query;

  // Build employee-level filter for department
  let employeeIds;
  if (department) {
    const emps = await Employee.find({ department }, '_id');
    employeeIds = emps.map((e) => e._id);
  }

  const filter = {};
  if (month) filter.month = month;
  if (year) filter.year = Number(year);
  if (status) filter.status = status;
  if (employeeIds) filter.employee = { $in: employeeIds };

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Payroll.countDocuments(filter);
  const records = await Payroll.find(filter)
    .populate('employee', 'name email avatar designation department')
    .sort({ year: -1, createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  return sendSuccess(res, records, 'Payroll records fetched', 200, {
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
});

// ─── POST /api/payroll/process  (admin only) ─────────────────────────────────
/**
 * Generates payroll records for all active employees for a given month/year.
 * Salary breakdown: basic=50%, hra=20%, da=5%, medical=1250, conveyance=1600
 * Deductions: pf=12% of basic, tds ~8% of (basic+hra), professional_tax=200
 */
export const processPayroll = asyncHandler(async (req, res) => {
  const { month, year } = req.body; // e.g. { month: "July 2025", year: 2025 }

  const employees = await Employee.find({ status: 'Active', accountStatus: 'approved' });

  const results = [];
  const errors = [];

  for (const emp of employees) {
    try {
      const basic = Math.round(emp.salary * 0.5);
      const hra = Math.round(emp.salary * 0.2);
      const da = Math.round(emp.salary * 0.05);
      const medical = 1250;
      const conveyance = 1600;
      const gross = basic + hra + da + medical + conveyance;
      const pf = Math.round(basic * 0.12);
      const esic = emp.salary <= 21000 ? Math.round(gross * 0.0075) : 0;
      const tds = Math.round((basic + hra) * 0.08);
      const professional_tax = 200;
      const total_deductions = pf + esic + tds + professional_tax;
      const net_pay = gross - total_deductions;

      const record = await Payroll.findOneAndUpdate(
        { employee: emp._id, month, year: Number(year) },
        {
          employee: emp._id,
          month,
          year: Number(year),
          basic,
          hra,
          da,
          medical,
          conveyance,
          gross,
          pf,
          esic,
          tds,
          professional_tax,
          total_deductions,
          net_pay,
          status: 'processed',
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      results.push(record._id);

      // Notify employee
      await Notification.create({
        user: emp._id,
        type: 'payroll',
        title: 'Payslip Available',
        message: `Your payslip for ${month} is now available.`,
      });
    } catch (e) {
      errors.push({ employee: emp.name, error: e.message });
    }
  }

  return sendSuccess(
    res,
    { processed: results.length, errors },
    `Payroll processed for ${results.length} employees`,
    201
  );
});

// ─── PUT /api/payroll/:id/status  (admin only) ───────────────────────────────
export const updatePayrollStatus = asyncHandler(async (req, res) => {
  const { status, paidOn } = req.body;
  const payroll = await Payroll.findByIdAndUpdate(
    req.params.id,
    { $set: { status, paidOn: paidOn || null } },
    { new: true, runValidators: true }
  ).populate('employee', 'name email');

  if (!payroll) return sendError(res, 'Payroll record not found', 404);
  return sendSuccess(res, payroll, 'Payroll status updated');
});
