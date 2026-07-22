import mongoose from 'mongoose';

const kpiSchema = new mongoose.Schema(
  {
    delivery: { type: Number, default: null },
    quality: { type: Number, default: null },
    teamwork: { type: Number, default: null },
    initiative: { type: Number, default: null },
  },
  { _id: false }
);

const appraisalSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    cycleName: { type: String, required: true },  // e.g. "Annual Appraisal 2025"
    year: { type: Number, required: true },
    rating: { type: Number, default: null },          // final/manager rating
    grade: { type: String, default: null },
    hike: { type: String, default: null },            // e.g. "18%"
    feedback: { type: String, default: '' },
    kpis: { type: kpiSchema, default: () => ({}) },
    selfAssessment: {
      submitted: { type: Boolean, default: false },
      submittedOn: { type: String, default: null },
      data: {
        kpis: { type: kpiSchema, default: null },
        overall: { type: Number, default: null },
        comments: { type: String, default: '' },
      },
    },
    managerReview: {
      submitted: { type: Boolean, default: false },
      submittedOn: { type: String, default: null },
      data: {
        rating: { type: Number, default: null },
        feedback: { type: String, default: '' },
        kpis: { type: kpiSchema, default: null },
      },
    },
    status: {
      type: String,
      enum: ['not-started', 'self-review', 'manager-review', 'completed'],
      default: 'not-started',
    },
  },
  { timestamps: true }
);

// One appraisal record per employee per cycle
appraisalSchema.index({ employee: 1, cycleName: 1, year: 1 }, { unique: true });

const Appraisal = mongoose.model('Appraisal', appraisalSchema);
export default Appraisal;
