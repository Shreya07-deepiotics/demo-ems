import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    date: { type: String, required: true }, // YYYY-MM-DD
    status: {
      type: String,
      enum: ['present', 'absent', 'late'],
      required: true,
    },
    checkIn: { type: String, default: null },  // HH:MM
    checkOut: { type: String, default: null }, // HH:MM
  },
  { timestamps: true }
);

// One record per employee per date
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
