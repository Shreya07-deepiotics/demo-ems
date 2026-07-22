import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'Casual',
        'Sick',
        'Earned',
        'Maternity',
        'Paternity',
        'Compensatory',
      ],
      required: true,
    },
    from: { type: String, required: true },   // YYYY-MM-DD
    to: { type: String, required: true },     // YYYY-MM-DD
    days: { type: Number, required: true },
    reason: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    appliedOn: { type: String, default: () => new Date().toISOString().split('T')[0] },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    // Which approval level is this request currently at
    level: {
      type: String,
      enum: ['teamlead', 'manager'],
      default: 'teamlead',
    },
    rejectionReason: { type: String, default: '' },
  },
  { timestamps: true }
);

const Leave = mongoose.model('Leave', leaveSchema);
export default Leave;
