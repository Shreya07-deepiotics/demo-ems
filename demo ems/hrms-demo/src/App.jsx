import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AppLayout from './components/layout/AppLayout';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import TeamLeadDashboard from './pages/teamlead/TeamLeadDashboard';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import HRDashboard from './pages/hr/HRDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import EmployeeManagementPage from './pages/admin/EmployeeManagementPage';
import AdminLeaveApprovalsPage from './pages/admin/AdminLeaveApprovalsPage';
import AttendancePage from './pages/shared/AttendancePage';
import LeavePage from './pages/shared/LeavePage';
import LeaveApprovalsPage from './pages/shared/LeaveApprovalsPage';
import TeamPage from './pages/shared/TeamPage';
import PayslipsPage from './pages/shared/PayslipsPage';
import AppraisalPage from './pages/shared/AppraisalPage';
import PerformancePage from './pages/shared/PerformancePage';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
      <p className="text-4xl font-bold mb-2">404</p>
      <p className="text-sm">Page not found</p>
    </div>
  );
}

export default function App() {
  const [auth, setAuth] = useState(null); // { role, user }

  const handleLogin = (role, user) => setAuth({ role, user });
  const handleLogout = () => setAuth(null);

  if (!auth) {
    return <Login onLogin={handleLogin} />;
  }

  const { role, user } = auth;

  const DashboardComponent = {
    employee: EmployeeDashboard,
    teamlead: TeamLeadDashboard,
    manager: ManagerDashboard,
    hr: HRDashboard,
    admin: AdminDashboard,
  }[role] || EmployeeDashboard;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout role={role} user={user} onLogout={handleLogout} />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardComponent user={user} role={role} />} />
          <Route path="attendance" element={<AttendancePage user={user} role={role} />} />
          <Route path="leave" element={<LeavePage user={user} role={role} />} />
          <Route path="leave-approvals" element={<LeaveApprovalsPage user={user} role={role} />} />
          <Route path="leave-management" element={<LeavePage user={user} role={role} />} />
          <Route path="team" element={<TeamPage user={user} role={role} />} />
          <Route path="payslips" element={<PayslipsPage user={user} role={role} />} />
          <Route path="finance/payroll" element={<PayslipsPage user={user} role={role} />} />
          <Route path="appraisal" element={<AppraisalPage user={user} role={role} />} />
          <Route path="performance" element={<PerformancePage user={user} role={role} />} />
          <Route path="employees" element={<HRDashboard user={user} role={role} />} />
          <Route path="onboarding" element={<HRDashboard user={user} role={role} />} />
          <Route path="analytics" element={<AdminDashboard user={user} role={role} />} />
          <Route path="roles" element={<AdminDashboard user={user} role={role} />} />
          <Route path="reports" element={<PerformancePage user={user} role={role} />} />
          <Route path="settings" element={<AdminDashboard user={user} role={role} />} />
          <Route path="admin/employees" element={<EmployeeManagementPage user={user} role={role} />} />
          <Route path="admin/leave-approvals" element={<AdminLeaveApprovalsPage user={user} role={role} />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
