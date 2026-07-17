export const leaveBalance = {
  casual: { total: 12, used: 4, remaining: 8 },
  sick: { total: 10, used: 2, remaining: 8 },
  earned: { total: 15, used: 5, remaining: 10 },
  maternity: { total: 180, used: 0, remaining: 180 },
};

export const myLeaveRequests = [
  { id: 1, type: 'Casual Leave', from: '2025-07-04', to: '2025-07-04', days: 1, reason: 'Personal work', status: 'approved', appliedOn: '2025-07-01', approvedBy: 'Rohit Verma' },
  { id: 2, type: 'Sick Leave', from: '2025-06-20', to: '2025-06-21', days: 2, reason: 'Fever and cold', status: 'approved', appliedOn: '2025-06-20', approvedBy: 'Rohit Verma' },
  { id: 3, type: 'Earned Leave', from: '2025-08-11', to: '2025-08-15', days: 5, reason: 'Family vacation', status: 'pending', appliedOn: '2025-07-10', approvedBy: null },
  { id: 4, type: 'Casual Leave', from: '2025-05-02', to: '2025-05-02', days: 1, reason: 'Appointment', status: 'rejected', appliedOn: '2025-04-30', approvedBy: 'Rohit Verma' },
  { id: 5, type: 'Sick Leave', from: '2025-04-08', to: '2025-04-09', days: 2, reason: 'Viral fever', status: 'approved', appliedOn: '2025-04-08', approvedBy: 'Rohit Verma' },
];

export const pendingLeaveApprovals = [
  { id: 3, employeeId: 1, employeeName: 'Arjun Sharma', avatar: 'AS', designation: 'Sr. Software Engineer', type: 'Earned Leave', from: '2025-08-11', to: '2025-08-15', days: 5, reason: 'Family vacation', appliedOn: '2025-07-10', level: 'teamlead' },
  { id: 6, employeeId: 6, employeeName: 'Kavya Reddy', avatar: 'KR', designation: 'Frontend Developer', type: 'Sick Leave', from: '2025-07-17', to: '2025-07-18', days: 2, reason: 'Medical checkup', appliedOn: '2025-07-14', level: 'teamlead' },
  { id: 7, employeeId: 9, employeeName: 'Rahul Joshi', avatar: 'RJ', designation: 'QA Engineer', type: 'Casual Leave', from: '2025-07-22', to: '2025-07-22', days: 1, reason: 'Personal errand', appliedOn: '2025-07-15', level: 'manager' },
  { id: 8, employeeId: 13, employeeName: 'Deepak Singh', avatar: 'DS', designation: 'Data Scientist', type: 'Earned Leave', from: '2025-08-01', to: '2025-08-05', days: 5, reason: 'Home town visit', appliedOn: '2025-07-12', level: 'manager' },
];

export const orgLeaveCalendar = [
  { date: '2025-07-17', employees: ['Kavya Reddy', 'Nisha Gupta'], type: 'Sick Leave' },
  { date: '2025-07-22', employees: ['Rahul Joshi'], type: 'Casual Leave' },
  { date: '2025-08-01', employees: ['Deepak Singh'], type: 'Earned Leave' },
  { date: '2025-08-11', employees: ['Arjun Sharma'], type: 'Earned Leave' },
];

export const leaveTypes = ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Maternity Leave', 'Paternity Leave', 'Compensatory Leave'];
