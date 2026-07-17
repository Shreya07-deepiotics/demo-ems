export const attendanceData = [
  { date: '2025-07-01', status: 'present' },
  { date: '2025-07-02', status: 'present' },
  { date: '2025-07-03', status: 'present' },
  { date: '2025-07-04', status: 'absent'  },
  { date: '2025-07-05', status: 'present' },
  { date: '2025-07-07', status: 'late'    },
  { date: '2025-07-08', status: 'present' },
  { date: '2025-07-09', status: 'present' },
  { date: '2025-07-10', status: 'present' },
  { date: '2025-07-11', status: 'present' },
  { date: '2025-07-12', status: 'present' },
  { date: '2025-07-14', status: 'late'    },
  { date: '2025-07-15', status: 'present' },
];

export const monthlyAttendanceSummary = {
  present: 18,
  absent: 2,
  late: 3,
  totalWorkingDays: 23,
};

export const attendanceChartData = [
  { week: 'Wk 1', present: 5, absent: 0, late: 0 },
  { week: 'Wk 2', present: 4, absent: 1, late: 1 },
  { week: 'Wk 3', present: 5, absent: 0, late: 1 },
  { week: 'Wk 4', present: 4, absent: 1, late: 1 },
];

export const teamAttendanceToday = [
  { id: 1,  name: 'Arjun Sharma', designation: 'Senior Software Engineer', status: 'present', avatar: 'AS' },
  { id: 6,  name: 'Kavya Reddy',  designation: 'Frontend Developer',       status: 'present', avatar: 'KR' },
  { id: 7,  name: 'Aditya Kumar', designation: 'DevOps Engineer',          status: 'late',    avatar: 'AK' },
  { id: 8,  name: 'Nisha Gupta',  designation: 'UX Designer',              status: 'absent',  avatar: 'NG' },
  { id: 9,  name: 'Rahul Joshi',  designation: 'QA Engineer',              status: 'present', avatar: 'RJ' },
  { id: 13, name: 'Deepak Singh', designation: 'Data Scientist',           status: 'present', avatar: 'DS' },
];
