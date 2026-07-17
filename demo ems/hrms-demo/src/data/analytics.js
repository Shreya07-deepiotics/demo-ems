export const headcountByDept = [
  { department: 'Engineering', count: 8 },
  { department: 'HR', count: 3 },
  { department: 'Finance', count: 2 },
  { department: 'Product', count: 2 },
  { department: 'Design', count: 2 },
  { department: 'Marketing', count: 2 },
  { department: 'Sales', count: 2 },
];

export const attritionTrend = [
  { month: 'Jan', attrition: 1 },
  { month: 'Feb', attrition: 0 },
  { month: 'Mar', attrition: 2 },
  { month: 'Apr', attrition: 1 },
  { month: 'May', attrition: 0 },
  { month: 'Jun', attrition: 1 },
  { month: 'Jul', attrition: 1 },
];

export const leaveTrend = [
  { month: 'Jan', casual: 8, sick: 5, earned: 3 },
  { month: 'Feb', casual: 6, sick: 8, earned: 2 },
  { month: 'Mar', casual: 10, sick: 4, earned: 6 },
  { month: 'Apr', casual: 7, sick: 3, earned: 10 },
  { month: 'May', casual: 9, sick: 6, earned: 4 },
  { month: 'Jun', casual: 5, sick: 7, earned: 8 },
  { month: 'Jul', casual: 4, sick: 3, earned: 5 },
];

export const orgStats = {
  totalEmployees: 21,
  activeToday: 18,
  attendancePercent: 85.7,
  pendingApprovals: 4,
  openPositions: 3,
  onLeaveToday: 2,
};

export const onboardingCandidates = [
  { id: 1, name: 'Prateek Anand', designation: 'Backend Engineer', department: 'Engineering', joinDate: '2025-07-21', stage: 'documents_pending', avatar: 'PA' },
  { id: 2, name: 'Ritika Sharma', designation: 'HR Intern', department: 'Human Resources', joinDate: '2025-07-28', stage: 'verification', avatar: 'RS' },
  { id: 3, name: 'Mohit Taneja', designation: 'Sales Executive', department: 'Sales', joinDate: '2025-08-04', stage: 'completed', avatar: 'MT' },
  { id: 4, name: 'Divya Nair', designation: 'Product Analyst', department: 'Product', joinDate: '2025-08-11', stage: 'documents_pending', avatar: 'DN' },
];

export const offboardingCandidates = [
  { id: 1, name: 'Karan Malhotra', designation: 'Sales Manager', department: 'Sales', lastDay: '2025-07-31', stage: 'documents_pending', avatar: 'KM', reason: 'Resignation' },
  { id: 2, name: 'Amit Rathore', designation: 'Marketing Associate', department: 'Marketing', lastDay: '2025-08-15', stage: 'verification', avatar: 'AR', reason: 'Better Opportunity' },
];

export const rolesPermissions = [
  { role: 'Admin', canViewAllEmployees: true, canEditEmployees: true, canApproveLeaves: true, canProcessPayroll: true, canManageRoles: true, canViewReports: true },
  { role: 'HR', canViewAllEmployees: true, canEditEmployees: true, canApproveLeaves: true, canProcessPayroll: true, canManageRoles: false, canViewReports: true },
  { role: 'Manager', canViewAllEmployees: false, canEditEmployees: false, canApproveLeaves: true, canProcessPayroll: false, canManageRoles: false, canViewReports: true },
  { role: 'Team Lead', canViewAllEmployees: false, canEditEmployees: false, canApproveLeaves: true, canProcessPayroll: false, canManageRoles: false, canViewReports: false },
  { role: 'Employee', canViewAllEmployees: false, canEditEmployees: false, canApproveLeaves: false, canProcessPayroll: false, canManageRoles: false, canViewReports: false },
];
