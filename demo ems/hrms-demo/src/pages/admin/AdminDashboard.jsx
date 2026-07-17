import { useState } from 'react';
import { Users, TrendingDown, Clock, Briefcase, BarChart3, Shield, Settings, Activity } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Card, { CardHeader } from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import { useToast, ToastContainer } from '../../components/ui/Toast';
import { headcountByDept, attritionTrend, leaveTrend, orgStats, rolesPermissions } from '../../data/analytics';

const permKeys = [
  { key: 'canViewAllEmployees', label: 'View All Employees' },
  { key: 'canEditEmployees', label: 'Edit Employees' },
  { key: 'canApproveLeaves', label: 'Approve Leaves' },
  { key: 'canProcessPayroll', label: 'Process Payroll' },
  { key: 'canManageRoles', label: 'Manage Roles' },
  { key: 'canViewReports', label: 'View Reports' },
];



export default function AdminDashboard({ user, defaultTab }) {
  const { toasts, removeToast, toast } = useToast();
  const [activeTab, setActiveTab] = useState(defaultTab || 'overview');
  const [permissions, setPermissions] = useState(rolesPermissions);
  const [leaveEntitlements, setLeaveEntitlements] = useState([
    { type: 'Casual Leave',       days: 12 },
    { type: 'Sick Leave',         days: 10 },
    { type: 'Earned Leave',       days: 15 },
    { type: 'Maternity Leave',    days: 180 },
    { type: 'Paternity Leave',    days: 15 },
    { type: 'Compensatory Leave', days: 5 },
  ]);
  const [settings, setSettings] = useState({
    companyName:      'EMS',
    leavePolicy:      'Standard',
    workingDays:      '5',
    probationPeriod:  '3 months',
    noticePeriod:     '60 days',
    hq:               'India',
  });

  const togglePermission = (role, key) => {
    setPermissions(prev => prev.map(r => r.role === role ? { ...r, [key]: !r[key] } : r));
  };

  const saveSettings = () => {
    toast('Company settings saved successfully', 'success');
  };

  const updatePolicy = () => {
    toast('Leave policy updated successfully', 'success');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'roles', label: 'Roles & Permissions', icon: Shield },
    { id: 'settings', label: 'Company Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Admin Dashboard</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">Organization-wide overview · {user?.name}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value={orgStats.totalEmployees} subtitle="All departments" icon={Users} color="indigo" trendValue="2 this month" trend="up" />
        <StatCard title="Attendance Today" value={`${orgStats.attendancePercent}%`} subtitle={`${orgStats.activeToday} present`} icon={Activity} color="emerald" />
        <StatCard title="Pending Approvals" value={orgStats.pendingApprovals} subtitle="Leave requests" icon={Clock} color="amber" />
        <StatCard title="Open Positions" value={orgStats.openPositions} subtitle="Hiring pipeline" icon={Briefcase} color="blue" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-12 gap-5">
            {/* Headcount by dept */}
            <div className="col-span-12 lg:col-span-7">
              <Card>
                <CardHeader title="Headcount by Department" subtitle="Current employee distribution" icon={BarChart3} />
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={headcountByDept} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="department" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0', fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Employees" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Attrition */}
            <div className="col-span-12 lg:col-span-5">
              <Card>
                <CardHeader title="Attrition Trend" subtitle="Jan–Jul 2025" icon={TrendingDown} iconColor="text-red-500" iconBg="bg-red-50 dark:bg-red-900/20" />
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={attritionTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0', fontSize: 12, borderRadius: 8 }} />
                    <Line type="monotone" dataKey="attrition" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4, fill: '#ef4444' }} activeDot={{ r: 6 }} name="Attritions" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </div>

          {/* Leave trend */}
          <Card>
            <CardHeader title="Leave Trend" subtitle="Month-wise leave distribution by type" icon={Activity} />
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={leaveTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0', fontSize: 12, borderRadius: 8 }} />
                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="casual" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} name="Casual" />
                <Line type="monotone" dataKey="sick" stroke="#f87171" strokeWidth={2} dot={{ r: 3 }} name="Sick" />
                <Line type="monotone" dataKey="earned" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Earned" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Roles & Permissions tab */}
      {activeTab === 'roles' && (
        <Card padding={false}>
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Role Permissions Matrix</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Toggle permissions for each role. Changes take effect immediately.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Role</th>
                  {permKeys.map(p => (
                    <th key={p.key} className="px-4 py-3 text-center text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide whitespace-nowrap">{p.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissions.map(roleRow => (
                  <tr key={roleRow.role} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="px-5 py-3">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{roleRow.role}</span>
                    </td>
                    {permKeys.map(p => (
                      <td key={p.key} className="px-4 py-3 text-center">
                        <button
                          onClick={() => roleRow.role !== 'Admin' && togglePermission(roleRow.role, p.key)}
                          className={`w-10 h-5 rounded-full relative transition-all duration-200 focus:outline-none ${
                            roleRow[p.key] ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                          } ${roleRow.role === 'Admin' ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${roleRow[p.key] ? 'left-5' : 'left-0.5'}`} />
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 bg-amber-50 dark:bg-amber-900/20 border-t border-amber-100 dark:border-amber-800/40 text-xs text-amber-700 dark:text-amber-400">
            Admin permissions are locked and cannot be modified.
          </div>
        </Card>
      )}

      {/* Settings tab */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 lg:col-span-8">
            <Card>
              <CardHeader title="Company Settings" subtitle="General organization configuration" icon={Settings} />
              <div className="space-y-4">
                {[
                  { key: 'companyName', label: 'Company Name', type: 'text' },
                  { key: 'hq', label: 'Headquarters', type: 'text' },
                  { key: 'probationPeriod', label: 'Probation Period', type: 'text' },
                  { key: 'noticePeriod', label: 'Notice Period', type: 'text' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">{field.label}</label>
                    <input
                      type={field.type}
                      value={settings[field.key]}
                      onChange={e => setSettings({ ...settings, [field.key]: e.target.value })}
                      className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 dark:placeholder-slate-500"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Leave Policy</label>
                  <select value={settings.leavePolicy} onChange={e => setSettings({ ...settings, leavePolicy: e.target.value })} className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800">
                    <option>Standard</option><option>Liberal</option><option>Strict</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Working Days per Week</label>
                  <select value={settings.workingDays} onChange={e => setSettings({ ...settings, workingDays: e.target.value })} className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800">
                    <option value="5">5 Days (Mon–Fri)</option>
                    <option value="5.5">5.5 Days (Alt Sat)</option>
                    <option value="6">6 Days (Mon–Sat)</option>
                  </select>
                </div>
                <div className="flex justify-end pt-2">
                  <Button variant="primary" onClick={saveSettings}>Save Settings</Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Leave entitlements */}
          <div className="col-span-12 lg:col-span-4">
            <Card>
              <CardHeader title="Leave Entitlements" subtitle="Default annual allocation" icon={Clock} iconColor="text-teal-600 dark:text-teal-400" iconBg="bg-teal-50 dark:bg-teal-900/20" />
              <div className="space-y-3">
                {leaveEntitlements.map((l, i) => (
                  <div key={l.type} className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 dark:text-slate-300">{l.type}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={l.days}
                        onChange={e => setLeaveEntitlements(prev => prev.map((item, idx) => idx === i ? { ...item, days: parseInt(e.target.value) || 0 } : item))}
                        className="w-14 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 text-xs text-center focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      />
                      <span className="text-xs text-slate-400 dark:text-slate-500">days</span>
                    </div>
                  </div>
                ))}
                <Button variant="primary" size="sm" className="w-full mt-2" onClick={updatePolicy}>Update Policy</Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
