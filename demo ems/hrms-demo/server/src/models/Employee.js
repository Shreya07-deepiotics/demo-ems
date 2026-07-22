import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    phone: { type: String, default: '' },
    designation: { type: String, default: '' },
    department: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'On Leave'],
      default: 'Active',
    },
    joinDate: { type: String, default: '' }, // kept as string to match frontend format YYYY-MM-DD
    salary: { type: Number, default: 0 },
    role: {
      type: String,
      enum: ['employee', 'teamlead', 'manager', 'hr', 'admin'],
      default: 'employee',
    },
    // Refs stored as ObjectId but populated fields also carry name string for display
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
    teamLead: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
    avatar: { type: String, default: '' }, // initials e.g. "AS"
    location: { type: String, default: '' },
    gender: { type: String, default: '' },
    dob: { type: String, default: '' },
    // Account lifecycle
    accountStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    registeredAt: { type: Date, default: Date.now },
    approvedAt: { type: Date, default: null },
    approvalDeadline: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret.password; // never leak password in JSON output
        return ret;
      },
    },
  }
);

// Hash password before save
employeeSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare passwords
employeeSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;
