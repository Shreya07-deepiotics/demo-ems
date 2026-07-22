/**
 * Seed script — seeds the DB with the 15 employees from the frontend dummy data,
 * plus sample attendance, leave, payroll, appraisal, and notification records.
 *
 * Run: npm run seed  (from inside server/)
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../config/db.js';
import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Payroll from '../models/Payroll.js';
import Appraisal from '../models/Appraisal.js';
import Notification from '../models/Notification.js';

const HASHED_PW = await bcrypt.hash('password123', 12);

// ─── Raw employee data (mirrors frontend employees.js) ──────────────────────
const RAW_EMPLOYEES = [
  { name: 'Arjun Sharma',   email: 'arjun.sharma@ems.com',   phone: '+91 98765 43210', designation: 'Senior Software Engineer', department: 'Engineering',     status: 'Active',    joinDate: '2021-03-15', salary: 125000, role: 'employee',  avatar: 'AS', location: 'Indore', gender: 'Male',   dob: '1994-07-22' },
  { name: 'Priya Mehta',    email: 'priya.mehta@ems.com',    phone: '+91 98765 43211', designation: 'Engineering Manager',      department: 'Engineering',     status: 'Active',    joinDate: '2019-06-10', salary: 180000, role: 'manager',   avatar: 'PM', location: 'Indore', gender: 'Female', dob: '1990-02-14' },
  { name: 'Rohit Verma',    email: 'rohit.verma@ems.com',    phone: '+91 98765 43212', designation: 'Team Lead - Backend',      department: 'Engineering',     status: 'Active',    joinDate: '2020-01-20', salary: 145000, role: 'teamlead',  avatar: 'RV', location: 'Indore', gender: 'Male',   dob: '1992-11-03' },
  { name: 'Sneha Patel',    email: 'sneha.patel@ems.com',    phone: '+91 98765 43213', designation: 'HR Business Partner',      department: 'Human Resources', status: 'Active',    joinDate: '2020-08-05', salary: 110000, role: 'hr',        avatar: 'SP', location: 'Indore', gender: 'Female', dob: '1993-05-18' },
  { name: 'Vikram Nair',    email: 'vikram.nair@ems.com',    phone: '+91 98765 43214', designation: 'Chief People Officer',     department: 'Administration',  status: 'Active',    joinDate: '2018-01-01', salary: 280000, role: 'admin',     avatar: 'VN', location: 'Indore', gender: 'Male',   dob: '1985-09-12' },
  { name: 'Kavya Reddy',    email: 'kavya.reddy@ems.com',    phone: '+91 98765 43215', designation: 'Frontend Developer',       department: 'Engineering',     status: 'Active',    joinDate: '2022-04-11', salary: 95000,  role: 'employee',  avatar: 'KR', location: 'Indore', gender: 'Female', dob: '1997-03-25' },
  { name: 'Aditya Kumar',   email: 'aditya.kumar@ems.com',   phone: '+91 98765 43216', designation: 'DevOps Engineer',          department: 'Engineering',     status: 'Active',    joinDate: '2021-11-15', salary: 115000, role: 'employee',  avatar: 'AK', location: 'Indore', gender: 'Male',   dob: '1995-08-07' },
  { name: 'Nisha Gupta',    email: 'nisha.gupta@ems.com',    phone: '+91 98765 43217', designation: 'UX Designer',              department: 'Design',          status: 'Active',    joinDate: '2022-07-01', salary: 90000,  role: 'employee',  avatar: 'NG', location: 'Indore', gender: 'Female', dob: '1996-12-30' },
  { name: 'Rahul Joshi',    email: 'rahul.joshi@ems.com',    phone: '+91 98765 43218', designation: 'QA Engineer',              department: 'Engineering',     status: 'Active',    joinDate: '2023-01-09', salary: 85000,  role: 'employee',  avatar: 'RJ', location: 'Indore', gender: 'Male',   dob: '1998-04-15' },
  { name: 'Meera Krishnan', email: 'meera.krishnan@ems.com', phone: '+91 98765 43219', designation: 'HR Executive',             department: 'Human Resources', status: 'Active',    joinDate: '2023-03-20', salary: 75000,  role: 'employee',  avatar: 'MK', location: 'Indore', gender: 'Female', dob: '1999-01-08' },
  { name: 'Suresh Babu',    email: 'suresh.babu@ems.com',    phone: '+91 98765 43220', designation: 'Finance Manager',          department: 'Finance',         status: 'Active',    joinDate: '2020-09-14', salary: 140000, role: 'manager',   avatar: 'SB', location: 'Indore', gender: 'Male',   dob: '1993-06-22' },
  { name: 'Pooja Iyer',     email: 'pooja.iyer@ems.com',     phone: '+91 98765 43221', designation: 'Product Manager',          department: 'Product',         status: 'On Leave',  joinDate: '2019-11-25', salary: 160000, role: 'manager',   avatar: 'PI', location: 'Indore', gender: 'Female', dob: '1991-10-05' },
  { name: 'Deepak Singh',   email: 'deepak.singh@ems.com',   phone: '+91 98765 43222', designation: 'Data Scientist',           department: 'Engineering',     status: 'Active',    joinDate: '2022-02-28', salary: 130000, role: 'employee',  avatar: 'DS', location: 'Indore', gender: 'Male',   dob: '1995-07-19' },
  { name: 'Anjali Rao',     email: 'anjali.rao@ems.com',     phone: '+91 98765 43223', designation: 'Marketing Specialist',     department: 'Marketing',       status: 'Active',    joinDate: '2021-06-07', salary: 88000,  role: 'employee',  avatar: 'AR', location: 'Indore', gender: 'Female', dob: '1996-02-11' },
  { name: 'Karan Malhotra', email: 'karan.malhotra@ems.com', phone: '+91 98765 43224', designation: 'Sales Manager',            department: 'Sales',           status: 'Inactive',  joinDate: '2020-04-03', salary: 140000, role: 'manager',   avatar: 'KM', location: 'Indore', gender: 'Male',   dob: '1989-03-28' },
];

const seed = async () => {
  await connectDB();
  console.log('🌱  Starting seed...');

  // ── Wipe existing data ────────────────────────────────────────────────────
  await Promise.all([
    Employee.deleteMany({}),
    Attendance.deleteMany({}),
    Leave.deleteMany({}),
    Payroll.deleteMany({}),
    Appraisal.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log('🗑   Cleared existing data');

  // ── Insert employees (pass-through pre-save hook hashes pw) ──────────────
  // We bypass the pre-save hook by directly inserting with already-hashed pw
  // to avoid rehashing in a loop.
  const empDocs = RAW_EMPLOYEES.map((e) => ({
    ...e,
    password: HASHED_PW,
    accountStatus: 'approved',
    approvedAt: new Date(e.joinDate),
    registeredAt: new Date(e.joinDate),
  }));

  // Insert without triggering pre-save (insertMany skips hooks)
  const inserted = await Employee.insertMany(empDocs);
  console.log(`👥  Inserted ${inserted.length} employees`);

  // Build lookup map by email
  const byEmail = {};
  inserted.forEach((e) => { byEmail[e.email] = e; });

  // ── Assign manager / teamLead references ──────────────────────────────────
  const managerRef   = byEmail['priya.mehta@ems.com']._id;   // Engineering Manager
  const teamLeadRef  = byEmail['rohit.verma@ems.com']._id;   // Team Lead
  const adminRef     = byEmail['vikram.nair@ems.com']._id;   // Admin
  const hrRef        = byEmail['sneha.patel@ems.com']._id;   // HR
  const finMgrRef    = byEmail['suresh.babu@ems.com']._id;   // Finance Manager
  const prodMgrRef   = byEmail['pooja.iyer@ems.com']._id;    // Product Manager
  const salesMgrRef  = byEmail['karan.malhotra@ems.com']._id;// Sales Manager

  // Engineering employees → manager: Priya, teamLead: Rohit
  const engEmails = ['arjun.sharma@ems.com','kavya.reddy@ems.com','aditya.kumar@ems.com',
                     'nisha.gupta@ems.com','rahul.joshi@ems.com','deepak.singh@ems.com'];
  for (const email of engEmails) {
    await Employee.findByIdAndUpdate(byEmail[email]._id, { manager: managerRef, teamLead: teamLeadRef });
  }

  // Rohit (teamlead) → manager: Priya
  await Employee.findByIdAndUpdate(teamLeadRef, { manager: managerRef });
  // Priya (manager) → manager: Vikram
  await Employee.findByIdAndUpdate(managerRef, { manager: adminRef });
  // Sneha (hr) → manager: Vikram
  await Employee.findByIdAndUpdate(hrRef, { manager: adminRef });
  // Meera (employee, HR dept) → manager: Sneha
  await Employee.findByIdAndUpdate(byEmail['meera.krishnan@ems.com']._id, { manager: hrRef });
  // Finance/Product/Sales managers → admin
  await Employee.findByIdAndUpdate(finMgrRef,  { manager: adminRef });
  await Employee.findByIdAndUpdate(prodMgrRef, { manager: adminRef });
  await Employee.findByIdAndUpdate(salesMgrRef,{ manager: adminRef });
  // Anjali (Marketing) → admin
  await Employee.findByIdAndUpdate(byEmail['anjali.rao@ems.com']._id, { manager: adminRef });
  console.log('🔗  Manager/teamLead refs wired');

  // ── Attendance records (Arjun Sharma — mirrors frontend data) ────────────
  const arjunId = byEmail['arjun.sharma@ems.com']._id;
  const attendanceRows = [
    { date: '2025-07-01', status: 'present', checkIn: '09:05', checkOut: '18:10' },
    { date: '2025-07-02', status: 'present', checkIn: '09:10', checkOut: '18:15' },
    { date: '2025-07-03', status: 'present', checkIn: '09:00', checkOut: '18:00' },
    { date: '2025-07-04', status: 'absent',  checkIn: null,    checkOut: null    },
    { date: '2025-07-05', status: 'present', checkIn: '09:08', checkOut: '18:05' },
    { date: '2025-07-07', status: 'late',    checkIn: '10:15', checkOut: '18:30' },
    { date: '2025-07-08', status: 'present', checkIn: '09:02', checkOut: '18:00' },
    { date: '2025-07-09', status: 'present', checkIn: '09:05', checkOut: '18:10' },
    { date: '2025-07-10', status: 'present', checkIn: '09:00', checkOut: '18:00' },
    { date: '2025-07-11', status: 'present', checkIn: '09:00', checkOut: '18:00' },
    { date: '2025-07-12', status: 'present', checkIn: '09:10', checkOut: '18:20' },
    { date: '2025-07-14', status: 'late',    checkIn: '10:30', checkOut: '18:45' },
    { date: '2025-07-15', status: 'present', checkIn: '09:05', checkOut: '18:05' },
  ];
  await Attendance.insertMany(attendanceRows.map((r) => ({ employee: arjunId, ...r })));

  // Seed a few records for other team members too (today's date)
  const today = new Date().toISOString().split('T')[0];
  const teamForToday = [
    { email: 'kavya.reddy@ems.com',  status: 'present', checkIn: '09:05' },
    { email: 'aditya.kumar@ems.com', status: 'late',    checkIn: '10:05' },
    { email: 'rahul.joshi@ems.com',  status: 'present', checkIn: '09:00' },
    { email: 'deepak.singh@ems.com', status: 'present', checkIn: '09:10' },
  ];
  await Attendance.insertMany(
    teamForToday.map(({ email, status, checkIn }) => ({
      employee: byEmail[email]._id,
      date: today,
      status,
      checkIn,
    }))
  );
  console.log('📅  Attendance seeded');

  // ── Leave records ─────────────────────────────────────────────────────────
  const rohitId = byEmail['rohit.verma@ems.com']._id;
  await Leave.insertMany([
    { employee: arjunId, type: 'Casual',  from: '2025-07-04', to: '2025-07-04', days: 1, reason: 'Personal work',     status: 'approved', appliedOn: '2025-07-01', approvedBy: rohitId, level: 'teamlead' },
    { employee: arjunId, type: 'Sick',    from: '2025-06-20', to: '2025-06-21', days: 2, reason: 'Fever and cold',    status: 'approved', appliedOn: '2025-06-20', approvedBy: rohitId, level: 'teamlead' },
    { employee: arjunId, type: 'Earned',  from: '2025-08-11', to: '2025-08-15', days: 5, reason: 'Family vacation',   status: 'pending',  appliedOn: '2025-07-10', approvedBy: null,    level: 'teamlead' },
    { employee: arjunId, type: 'Casual',  from: '2025-05-02', to: '2025-05-02', days: 1, reason: 'Appointment',       status: 'rejected', appliedOn: '2025-04-30', approvedBy: rohitId, level: 'teamlead' },
    { employee: arjunId, type: 'Sick',    from: '2025-04-08', to: '2025-04-09', days: 2, reason: 'Viral fever',       status: 'approved', appliedOn: '2025-04-08', approvedBy: rohitId, level: 'teamlead' },
    { employee: byEmail['kavya.reddy@ems.com']._id,  type: 'Sick',   from: '2025-07-17', to: '2025-07-18', days: 2, reason: 'Medical checkup',   status: 'pending', appliedOn: '2025-07-14', level: 'teamlead' },
    { employee: byEmail['rahul.joshi@ems.com']._id,  type: 'Casual', from: '2025-07-22', to: '2025-07-22', days: 1, reason: 'Personal errand',   status: 'pending', appliedOn: '2025-07-15', level: 'manager'  },
    { employee: byEmail['deepak.singh@ems.com']._id, type: 'Earned', from: '2025-08-01', to: '2025-08-05', days: 5, reason: 'Home town visit',   status: 'pending', appliedOn: '2025-07-12', level: 'manager'  },
    { employee: byEmail['nisha.gupta@ems.com']._id,  type: 'Sick',   from: '2025-07-17', to: '2025-07-17', days: 1, reason: 'Not feeling well', status: 'approved', appliedOn: '2025-07-16', approvedBy: rohitId, level: 'teamlead' },
  ]);
  console.log('🏖   Leave records seeded');

  // ── Payroll records — 6 months for Arjun, current month for all ──────────
  const payrollMonths = [
    { month: 'January 2025', year: 2025 },
    { month: 'February 2025', year: 2025 },
    { month: 'March 2025', year: 2025 },
    { month: 'April 2025', year: 2025 },
    { month: 'May 2025', year: 2025 },
    { month: 'June 2025', year: 2025 },
  ];

  const buildPayslip = (empDoc, month, year, status = 'paid', paidOn = null) => {
    const basic        = Math.round(empDoc.salary * 0.5);
    const hra          = Math.round(empDoc.salary * 0.2);
    const da           = Math.round(empDoc.salary * 0.05);
    const medical      = 1250;
    const conveyance   = 1600;
    const gross        = basic + hra + da + medical + conveyance;
    const pf           = Math.round(basic * 0.12);
    const esic         = empDoc.salary <= 21000 ? Math.round(gross * 0.0075) : 0;
    const tds          = Math.round((basic + hra) * 0.08);
    const professional_tax = 200;
    const total_deductions = pf + esic + tds + professional_tax;
    const net_pay          = gross - total_deductions;
    return { employee: empDoc._id, month, year, basic, hra, da, medical, conveyance,
             gross, pf, esic, tds, professional_tax, total_deductions, net_pay, status, paidOn };
  };

  const arjunDoc = inserted.find((e) => e.email === 'arjun.sharma@ems.com');
  const arjunPayslips = payrollMonths.map(({ month, year }) =>
    buildPayslip(arjunDoc, month, year, 'paid', `${year}-${String(payrollMonths.findIndex(m => m.month === month) + 1).padStart(2,'0')}-28`)
  );
  await Payroll.insertMany(arjunPayslips);

  // Current month payroll for all active employees
  const julyPayroll = inserted
    .filter((e) => e.status !== 'Inactive')
    .map((emp) => buildPayslip(emp, 'July 2025', 2025, 'processed', null));
  await Payroll.insertMany(julyPayroll);
  console.log('💰  Payroll seeded');

  // ── Appraisal records ─────────────────────────────────────────────────────
  const CYCLE = 'Annual Appraisal 2025';
  const appraisalData = [
    { email: 'arjun.sharma@ems.com',   selfRating: 4.0, managerRating: 4.2, status: 'manager-review',
      selfKpis: { delivery: 4.0, quality: 4.0, teamwork: 4.2, initiative: 3.8 },
      selfComments: 'Delivered all sprint commitments. Led API refactoring initiative.',
      managerFeedback: 'Strong delivery, needs to improve documentation.',
      managerKpis: { delivery: 4.5, quality: 4.0, teamwork: 4.2, initiative: 3.8 } },
    { email: 'kavya.reddy@ems.com',    selfRating: 3.8, managerRating: null, status: 'self-review',
      selfKpis: { delivery: 3.8, quality: 4.0, teamwork: 4.0, initiative: 3.5 },
      selfComments: 'Revamped design system. Improved page load times by 40%.' },
    { email: 'aditya.kumar@ems.com',   selfRating: 4.2, managerRating: null, status: 'self-review',
      selfKpis: { delivery: 4.2, quality: 4.0, teamwork: 3.8, initiative: 4.5 },
      selfComments: 'Set up full CI/CD pipeline. Reduced deployment time from 40min to 8min.' },
    { email: 'nisha.gupta@ems.com',    selfRating: null, managerRating: null, status: 'not-started' },
    { email: 'rahul.joshi@ems.com',    selfRating: 3.5, managerRating: 3.6, status: 'completed',
      selfKpis: { delivery: 3.8, quality: 4.0, teamwork: 3.5, initiative: 3.0 },
      selfComments: 'Maintained 98% test coverage. Identified critical regression bugs.',
      managerFeedback: 'Reliable team member. Should take more initiative in test automation.',
      managerKpis: { delivery: 3.8, quality: 4.0, teamwork: 3.5, initiative: 3.0 } },
    { email: 'deepak.singh@ems.com',   selfRating: 4.5, managerRating: null, status: 'self-review',
      selfKpis: { delivery: 4.5, quality: 4.2, teamwork: 4.0, initiative: 4.8 },
      selfComments: 'Built 3 ML models that reduced churn by 22%.' },
  ];

  const appraisalDocs = appraisalData.map(({ email, selfRating, managerRating, status,
    selfKpis, selfComments, managerFeedback, managerKpis }) => ({
    employee: byEmail[email]._id,
    cycleName: CYCLE,
    year: 2025,
    rating: managerRating,
    grade: managerRating ? (managerRating >= 4.0 ? 'Exceeds Expectations' : 'Meets Expectations') : null,
    selfAssessment: {
      submitted: !!selfRating,
      submittedOn: selfRating ? '2025-06-28' : null,
      data: selfRating ? { kpis: selfKpis, overall: selfRating, comments: selfComments } : {},
    },
    managerReview: {
      submitted: !!managerRating,
      submittedOn: managerRating ? '2025-07-10' : null,
      data: managerRating ? { rating: managerRating, feedback: managerFeedback, kpis: managerKpis } : {},
    },
    kpis: managerKpis || selfKpis || {},
    status,
  }));
  await Appraisal.insertMany(appraisalDocs);
  console.log('⭐  Appraisals seeded');

  // ── Notifications ─────────────────────────────────────────────────────────
  await Notification.insertMany([
    { user: arjunId, type: 'leave',     title: 'Leave Approved',      message: 'Your Casual Leave for Jul 4 has been approved by Rohit Verma.',      read: false },
    { user: arjunId, type: 'payroll',   title: 'Payslip Available',   message: 'Your payslip for June 2025 is now available for download.',           read: false },
    { user: arjunId, type: 'appraisal', title: 'Appraisal Reminder',  message: 'Self-assessment for Annual Appraisal 2025 is due by June 30.',        read: true  },
    { user: rohitId, type: 'leave',     title: 'Leave Request Pending', message: 'Kavya Reddy has applied for Sick Leave on Jul 17–18. Action required.', read: false },
    { user: arjunId, type: 'system',    title: 'Policy Update',       message: 'Work From Home policy has been updated. Please review the new guidelines.', read: true },
    { user: rohitId, type: 'leave',     title: 'Leave Request Pending', message: 'Arjun Sharma has applied for Earned Leave Aug 11–15. Action required.', read: false },
    { user: byEmail['priya.mehta@ems.com']._id, type: 'leave', title: 'Leave Request Pending',
      message: 'Rahul Joshi has applied for Casual Leave on Jul 22. Action required.', read: false },
    { user: byEmail['priya.mehta@ems.com']._id, type: 'leave', title: 'Leave Request Pending',
      message: 'Deepak Singh has applied for Earned Leave Aug 1–5. Action required.', read: false },
  ]);
  console.log('🔔  Notifications seeded');

  console.log('\n✅  Seed complete!\n');
  console.log('Login credentials for all users:');
  console.log('  Password: password123\n');
  console.log('  admin    → vikram.nair@ems.com');
  console.log('  hr       → sneha.patel@ems.com');
  console.log('  manager  → priya.mehta@ems.com');
  console.log('  teamlead → rohit.verma@ems.com');
  console.log('  employee → arjun.sharma@ems.com');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌  Seed failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
