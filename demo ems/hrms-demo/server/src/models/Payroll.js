import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    month: { type: String, required: true },   // e.g. "June 2025"
    year: { type: Number, required: true },
    // Earnings
    basic: { type: Number, default: 0 },
    hra: { type: Number, default: 0 },
    da: { type: Number, default: 0 },
    medical: { type: Number, default: 0 },
    conveyance: { type: Number, default: 0 },
    gross: { type: Number, default: 0 },
    // Deductions
    pf: { type: Number, default: 0 },
    esic: { type: Number, default: 0 },
    tds: { type: Number, default: 0 },
    professional_tax: { type: Number, default: 0 },
    total_deductions: { type: Number, default: 0 },
    // Net
    net_pay: { type: Number, default: 0 },
    // Status
    status: {
      type: String,
      enum: ['pending', 'processed', 'paid'],
      default: 'pending',
    },
    paidOn: { type: String, default: null }, // YYYY-MM-DD
  },
  { timestamps: true }
);

// One payroll per employee per month+year
payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

const Payroll = mongoose.model('Payroll', payrollSchema);
export default Payroll;
