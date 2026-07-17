import { useState } from 'react';
import {
  Users, Search, UserPlus, UserMinus, DollarSign, ChevronRight,
  CheckCircle, XCircle, ArrowRight, LayoutDashboard, UserCheck,
  ClipboardList, TrendingUp, Briefcase, AlertCircle, Clock, X,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import Card, { CardHeader } from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import { useToast, ToastContainer } from '../../components/ui/Toast';
import { employees, departments } from '../../data/employees';
import { payrollTable } from '../../data/payroll';
import {
  onboardingCandidates as initOnboarding,
  offboardingCandidates as initOffboarding,
  orgStats, headcountByDept,
} from '../../data/analytics';
import { pendingLeaveApprovals, leaveTypes } from '../../data/leaves';

/* ─── Constants ──────────────────────────────────────────── */
const STAGES = ['documents_pending', 'verification', 'completed'];
const STAGE_META = {
  documents_pending: {
    label: 'Documents Pending',
    badge: 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400',
    header: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40',
  },
  verification: {
    label: 'Under Verification',
    badge: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400',
    header: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/40',
  },
  completed: {
    label: 'Completed',
    badge: 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400',
    header: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40',
  },
};

const DEPT_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316'];

/* ─── Kanban card ─────────────────────────────────────────── */
function KanbanCard({ person, isOffboarding, onAdvance, isLast }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            {person.avatar}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{person.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{person.designation}</p>
          </div>
        </div>
        {!isLast && (
          <button onClick={() => onAdvance(person.id)}
            className="flex-shrink-0 p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
            title="Advance to next stage"
          >
            <ArrowRight size={13} />
          </button>
        )}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-full">
          {person.department}
        </span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500">
          {isOffboarding ? `Last: ${person.lastDay}` : `Joins: ${person.joinDate}`}
        </span>
      </div>
      {isOffboarding && person.reason && (
        <p className="text-[10px] text-rose-500 dark:text-rose-400 mt-1.5 font-medium">{person.reason}</p>
      )}
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────── */
export default function HRDashboard({ user, defaultTab }) {
  const { toasts, removeToast, toast } = useToast();
  const [activeTab, setActiveTab]   = useState(defaultTab || 'overview');
  const [search, setSearch]         = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedEmp, setSelectedEmp]   = useState(null);
  const [onboardingList, setOnboardingList] = useState(initOnboarding);
  const [offboardingList, setOffboardingList] = useState(initOffboarding);
  const [payrollProcessed, setPayrollProcessed] = useState(false);
  const [payrollModal, setPayrollModal] = useState(false);
  const [leaveItems, setLeaveItems] = useState(
    pendingLeaveApprovals.map(a => ({ ...a, actionStatus: 'pending' }))
  );
  const [leaveModal, setLeaveModal] = useState(null);

  /* helpers */
  const advance = (list, setList, id, label) => {
    setList(prev => prev.map(p => {
      if (p.id !== id) return p;
      const next = STAGES[STAGES.indexOf(p.stage) + 1];
      toast(`${p.name} → ${STAGE_META[next].label}`, 'success');
      return { ...p, stage: next };
    }));
  };

  const confirmLeave = () => {
    const { type, item } = leaveModal;
    setLeaveItems(prev => prev.map(a =>
      a.id === item.id ? { ...a, actionStatus: type === 'approve' ? 'approved' : 'rejected' } : a
    ));
    toast(
      type === 'approve' ? `Leave approved for ${item.employeeName}` : `Leave rejected for ${item.employeeName}`,
      type === 'approve' ? 'success' : 'error'
    );
    setLeaveModal(null);
  };

  const filtered = employees.filter(e => {
    const q = search.toLowerCase();
    return (
      (!q || e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.designation.toLowerCase().includes(q)) &&
      (!deptFilter || e.department === deptFilter) &&
      (!statusFilter || e.status === statusFilter)
    );
  });

  const pendingLeaveCount = leaveItems.filter(a => a.actionStatus === 'pending').length;

  const tabs = [
    { id: 'overview',   label: 'Overview',        icon: LayoutDashboard },
    { id: 'directory',  label: 'Employees',        icon: Users,         count: employees.length },
    { id: 'onboarding', label: 'Onboarding',       icon: UserPlus,      count: onboardingList.length },
    { id: 'offboarding',label: 'Offboarding',      icon: UserMinus,     count: offboardingList.length },
    { id: 'leaves',     label: 'Leave Management', icon: ClipboardList, count: pendingLeaveCount, alert: pendingLeaveCount > 0 },
  ];

  const inputCls = `w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm
    bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200
    placeholder-slate-400 dark:placeholder-slate-500
    focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500`;

  /* ── Employee table columns ── */
  const empCols = [
    { key: 'name', label: 'Employee', render: (v, r) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">{r.avatar}</div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{v}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">{r.email}</p>
        </div>
      </div>
    )},
    { key: 'designation', label: 'Designation', render: v => <span className="text-sm text-slate-600 dark:text-slate-300">{v}</span> },
    { key: 'department',  label: 'Department',  render: v => (
      <span className="text-xs font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">{v}</span>
    )},
    { key: 'role', label: 'Role', render: v => (
      <span className="capitalize text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">{v}</span>
    )},
    { key: 'joinDate', label: 'Joined' },
    { key: 'status', label: 'Status', render: v => <Badge status={v.toLowerCase()}>{v}</Badge> },
    { key: 'id', label: '', render: (_, r) => (
      <Button variant="ghost" size="xs" onClick={() => setSelectedEmp(r)}>View <ChevronRight size={12} /></Button>
    )},
  ];

  /* ── Leave table columns ── */
  const leaveCols = [
    { key: 'employeeName', label: 'Employee', render: (v, r) => (
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">{r.avatar}</div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{v}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">{r.designation}</p>
        </div>
      </div>
    )},
    { key: 'type', label: 'Leave Type', render: v => <Badge status={v.toLowerCase()}>{v}</Badge> },
    { key: 'from', label: 'From' },
    { key: 'to',   label: 'To' },
    { key: 'days', label: 'Days', render: v => <span className="font-semibold text-slate-800 dark:text-slate-200">{v}d</span> },
    { key: 'reason', label: 'Reason', render: v => <span className="text-xs text-slate-500 dark:text-slate-400 italic max-w-32 truncate block">"{v}"</span> },
    { key: 'actionStatus', label: 'Status', render: v => <Badge status={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</Badge> },
    { key: 'id', label: 'Action', render: (_, r) =>
      r.actionStatus === 'pending' ? (
        <div className="flex gap-1.5">
          <Button variant="success" size="xs" icon={CheckCircle} onClick={() => setLeaveModal({ type: 'approve', item: r })}>Approve</Button>
          <Button variant="danger"  size="xs" icon={XCircle}     onClick={() => setLeaveModal({ type: 'reject',  item: r })}>Reject</Button>
        </div>
      ) : <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
    },
  ];

  /* ── Payroll columns ── */
  const payrollCols = [
    { key: 'name', label: 'Employee', render: (v, r) => (
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">{r.avatar}</div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{v}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">{r.designation}</p>
        </div>
      </div>
    )},
    { key: 'basic',    label: 'Basic',    render: v => `₹${v.toLocaleString('en-IN')}` },
    { key: 'gross',    label: 'Gross',    render: v => `₹${v.toLocaleString('en-IN')}` },
    { key: 'pf',       label: 'PF',       render: v => <span className="text-red-500 dark:text-red-400">₹{v.toLocaleString('en-IN')}</span> },
    { key: 'tds',      label: 'TDS',      render: v => <span className="text-red-500 dark:text-red-400">₹{v.toLocaleString('en-IN')}</span> },
    { key: 'net_pay',  label: 'Net Pay',  render: v => <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{v.toLocaleString('en-IN')}</span> },
    { key: 'status',   label: 'Status',   render: () => <Badge status={payrollProcessed ? 'processed' : 'pending'}>{payrollProcessed ? 'Processed' : 'Pending'}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">HR Dashboard</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">People Operations · {user?.name}</p>
        </div>
        {pendingLeaveCount > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 px-4 py-2 rounded-xl">
            <AlertCircle size={14} className="text-amber-500 flex-shrink-0" />
            <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">{pendingLeaveCount} leave request{pendingLeaveCount > 1 ? 's' : ''} pending</span>
          </div>
        )}
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employees"  value={orgStats.totalEmployees}    subtitle="All departments"                   icon={Users}      color="indigo"  trendValue="+2 this month" trend="up" />
        <StatCard title="Present Today"    value={orgStats.activeToday}        subtitle={`${orgStats.attendancePercent}% attendance`} icon={UserCheck}  color="emerald" />
        <StatCard title="On Leave Today"   value={orgStats.onLeaveToday}       subtitle="Active absences"                  icon={Clock}      color="amber"   />
        <StatCard title="Open Positions"   value={orgStats.openPositions}      subtitle="Hiring in progress"               icon={Briefcase}  color="blue"    />
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon, count, alert }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-150 ${
              activeTab === id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Icon size={14} />
            {label}
            {count !== undefined && count !== null && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                alert
                  ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
                  : activeTab === id
                    ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}>{count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════
          OVERVIEW TAB
      ══════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-12 gap-5">
            {/* Headcount by dept bar chart */}
            <div className="col-span-12 lg:col-span-7">
              <Card>
                <CardHeader title="Headcount by Department" subtitle="Current employee distribution" icon={Users} />
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={headcountByDept} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="department" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0', fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="count" radius={[6,6,0,0]} name="Employees" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Dept pie chart */}
            <div className="col-span-12 lg:col-span-5">
              <Card>
                <CardHeader title="Department Split" subtitle="Percentage distribution" icon={TrendingUp} />
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie data={headcountByDept} dataKey="count" nameKey="department" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                      {headcountByDept.map((_, i) => <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0', fontSize: 12, borderRadius: 8 }} />
                    <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </div>

          {/* Quick status row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Onboarding progress */}
            <Card>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                  <UserPlus size={16} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Onboarding</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{onboardingList.length} candidates</p>
                </div>
              </div>
              {STAGES.map(s => (
                <div key={s} className="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800 last:border-0">
                  <span className="text-xs text-slate-500 dark:text-slate-400">{STAGE_META[s].label}</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{onboardingList.filter(c => c.stage === s).length}</span>
                </div>
              ))}
              <Button variant="ghost" size="xs" className="w-full mt-2" onClick={() => setActiveTab('onboarding')}>View All →</Button>
            </Card>

            {/* Offboarding */}
            <Card>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center">
                  <UserMinus size={16} className="text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Offboarding</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{offboardingList.length} in process</p>
                </div>
              </div>
              {offboardingList.map(c => (
                <div key={c.id} className="flex items-center gap-2 py-1.5 border-b border-slate-50 dark:border-slate-800 last:border-0">
                  <div className="w-6 h-6 rounded-lg bg-rose-600 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">{c.avatar}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{c.name}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Last day: {c.lastDay}</p>
                  </div>
                </div>
              ))}
              <Button variant="ghost" size="xs" className="w-full mt-2" onClick={() => setActiveTab('offboarding')}>View All →</Button>
            </Card>

            {/* Leave summary */}
            <Card>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                  <ClipboardList size={16} className="text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Leave Requests</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{leaveItems.length} total</p>
                </div>
              </div>
              {[
                { label: 'Pending',  count: leaveItems.filter(a => a.actionStatus === 'pending').length,  color: 'text-amber-600 dark:text-amber-400' },
                { label: 'Approved', count: leaveItems.filter(a => a.actionStatus === 'approved').length, color: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Rejected', count: leaveItems.filter(a => a.actionStatus === 'rejected').length, color: 'text-red-500 dark:text-red-400' },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800 last:border-0">
                  <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
                  <span className={`text-xs font-bold ${color}`}>{count}</span>
                </div>
              ))}
              <Button variant="ghost" size="xs" className="w-full mt-2" onClick={() => setActiveTab('leaves')}>Manage Leaves →</Button>
            </Card>
          </div>

          {/* Recent employees */}
          <Card padding={false}>
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Employees</h3>
              <Button variant="ghost" size="xs" onClick={() => setActiveTab('directory')}>View All →</Button>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {[...employees].sort((a, b) => b.joinDate.localeCompare(a.joinDate)).slice(0, 5).map(emp => (
                <div key={emp.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">{emp.avatar}</div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{emp.name}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{emp.designation} · {emp.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 dark:text-slate-500">{emp.joinDate}</span>
                    <Badge status={emp.status.toLowerCase()}>{emp.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ══ EMPLOYEE DIRECTORY ══ */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          <Card>
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, email, designation…"
                  className={`${inputCls} pl-9`} />
                {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={13} /></button>}
              </div>
              <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                <option value="">All Departments</option>
                {departments.map(d => <option key={d}>{d}</option>)}
              </select>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                <option value="">All Status</option>
                <option>Active</option><option>Inactive</option><option>On Leave</option>
              </select>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{filtered.length} of {employees.length}</span>
            </div>
          </Card>
          <Card padding={false}>
            <Table columns={empCols} data={filtered} emptyMessage="No employees match your filters" />
          </Card>
        </div>
      )}

      {/* ══ ONBOARDING KANBAN ══ */}
      {activeTab === 'onboarding' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Onboarding Pipeline</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{onboardingList.length} candidates across {STAGES.length} stages</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-5">
            {STAGES.map(stage => {
              const items = onboardingList.filter(c => c.stage === stage);
              return (
                <div key={stage}>
                  <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl border mb-3 ${STAGE_META[stage].header}`}>
                    <span className={`text-xs font-bold ${STAGE_META[stage].badge.split(' ').filter(c => c.startsWith('text-')).join(' ')}`}>
                      {STAGE_META[stage].label}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-slate-800/60 px-2 py-0.5 rounded-full">
                      {items.length}
                    </span>
                  </div>
                  <div className="space-y-3 min-h-20">
                    {items.map(c => (
                      <KanbanCard key={c.id} person={c}
                        onAdvance={(id) => advance(onboardingList, setOnboardingList, id)}
                        isLast={stage === 'completed'} />
                    ))}
                    {items.length === 0 && (
                      <div className="text-xs text-slate-400 dark:text-slate-500 text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                        No candidates
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ OFFBOARDING KANBAN ══ */}
      {activeTab === 'offboarding' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Offboarding Pipeline</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{offboardingList.length} employees in exit process</p>
          </div>
          <div className="grid grid-cols-3 gap-5">
            {STAGES.map(stage => {
              const items = offboardingList.filter(c => c.stage === stage);
              return (
                <div key={stage}>
                  <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl border mb-3 ${STAGE_META[stage].header}`}>
                    <span className={`text-xs font-bold ${STAGE_META[stage].badge.split(' ').filter(c => c.startsWith('text-')).join(' ')}`}>
                      {STAGE_META[stage].label}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-slate-800/60 px-2 py-0.5 rounded-full">
                      {items.length}
                    </span>
                  </div>
                  <div className="space-y-3 min-h-20">
                    {items.map(c => (
                      <KanbanCard key={c.id} person={c} isOffboarding
                        onAdvance={(id) => advance(offboardingList, setOffboardingList, id)}
                        isLast={stage === 'completed'} />
                    ))}
                    {items.length === 0 && (
                      <div className="text-xs text-slate-400 dark:text-slate-500 text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                        No candidates
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ LEAVE MANAGEMENT ══ */}
      {activeTab === 'leaves' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Pending',  count: leaveItems.filter(a => a.actionStatus === 'pending').length,  color: 'amber',   icon: Clock },
              { label: 'Approved', count: leaveItems.filter(a => a.actionStatus === 'approved').length, color: 'emerald', icon: CheckCircle },
              { label: 'Rejected', count: leaveItems.filter(a => a.actionStatus === 'rejected').length, color: 'red',     icon: XCircle },
            ].map(({ label, count, color, icon: Icon }) => (
              <div key={label} className={`bg-${color}-50 dark:bg-${color}-900/20 border border-${color}-200 dark:border-${color}-800/40 rounded-2xl p-4 flex items-center gap-3`}>
                <div className={`w-10 h-10 bg-${color}-100 dark:bg-${color}-900/40 rounded-xl flex items-center justify-center`}>
                  <Icon size={18} className={`text-${color}-600 dark:text-${color}-400`} />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{count}</p>
                  <p className={`text-xs font-semibold text-${color}-700 dark:text-${color}-400`}>{label}</p>
                </div>
              </div>
            ))}
          </div>
          <Card padding={false}>
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Leave Requests</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">All organisation-wide leave requests</p>
            </div>
            <Table columns={leaveCols} data={leaveItems} />
          </Card>
        </div>
      )}

      {/* ══ PAYROLL ══ */}
      {activeTab === 'payroll' && (
        <div className="space-y-4">
          {/* Summary row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Gross',      value: `₹${payrollTable.reduce((s, e) => s + e.gross, 0).toLocaleString('en-IN')}`,       color: 'indigo' },
              { label: 'Total Deductions', value: `₹${payrollTable.reduce((s, e) => s + e.total_deductions, 0).toLocaleString('en-IN')}`, color: 'red' },
              { label: 'Total Net Pay',    value: `₹${payrollTable.reduce((s, e) => s + e.net_pay, 0).toLocaleString('en-IN')}`,      color: 'emerald' },
            ].map(({ label, value, color }) => (
              <div key={label} className={`bg-${color}-50 dark:bg-${color}-900/20 border border-${color}-200 dark:border-${color}-800/40 rounded-2xl p-4`}>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{label}</p>
                <p className={`text-xl font-extrabold text-${color}-600 dark:text-${color}-400`}>{value}</p>
              </div>
            ))}
          </div>
          <Card padding={false}>
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Payroll — July 2025</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  {payrollProcessed ? '✓ Disbursed successfully' : `${payrollTable.length} employees · pending disbursement`}
                </p>
              </div>
              <Button variant={payrollProcessed ? 'secondary' : 'primary'} icon={DollarSign}
                disabled={payrollProcessed} onClick={() => setPayrollModal(true)}>
                {payrollProcessed ? '✓ Processed' : 'Process Payroll'}
              </Button>
            </div>
            <Table columns={payrollCols} data={payrollTable} />
          </Card>
        </div>
      )}

      {/* ══ PROCESS PAYROLL MODAL ══ */}
      <Modal isOpen={payrollModal} onClose={() => setPayrollModal(false)}
        title="Confirm Payroll Processing" size="sm"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setPayrollModal(false)}>Cancel</Button>
            <Button variant="primary" icon={DollarSign} onClick={() => {
              setPayrollProcessed(true);
              setPayrollModal(false);
              toast('Payroll for July 2025 processed & disbursed', 'success');
            }}>Confirm & Disburse</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Processing payroll for <strong>{payrollTable.length} employees</strong> for <strong>July 2025</strong>.
          </p>
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-2.5 text-sm border border-slate-100 dark:border-slate-700">
            {[
              ['Employees', payrollTable.length],
              ['Total Gross', `₹${payrollTable.reduce((s, e) => s + e.gross, 0).toLocaleString('en-IN')}`],
              ['Total Deductions', `₹${payrollTable.reduce((s, e) => s + e.total_deductions, 0).toLocaleString('en-IN')}`],
              ['Net Payout', `₹${payrollTable.reduce((s, e) => s + e.net_pay, 0).toLocaleString('en-IN')}`],
            ].map(([k, v], i) => (
              <div key={k} className={`flex justify-between ${i === 3 ? 'border-t border-slate-200 dark:border-slate-600 pt-2 font-bold' : ''}`}>
                <span className="text-slate-500 dark:text-slate-400">{k}</span>
                <span className={i === 3 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}>{v}</span>
              </div>
            ))}
          </div>
          <div className="flex items-start gap-2.5 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl">
            <AlertCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-300">This action cannot be undone for the current cycle.</p>
          </div>
        </div>
      </Modal>

      {/* ══ LEAVE ACTION MODAL ══ */}
      <Modal isOpen={!!leaveModal} onClose={() => setLeaveModal(null)}
        title={leaveModal?.type === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'} size="sm"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setLeaveModal(null)}>Cancel</Button>
            <Button variant={leaveModal?.type === 'approve' ? 'success' : 'danger'} onClick={confirmLeave}>
              {leaveModal?.type === 'approve' ? 'Yes, Approve' : 'Yes, Reject'}
            </Button>
          </div>
        }
      >
        {leaveModal && (
          <div className="space-y-3">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {leaveModal.type === 'approve' ? 'Approve' : 'Reject'} <strong>{leaveModal.item.type}</strong> for <strong>{leaveModal.item.employeeName}</strong>?
            </p>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-2 text-sm border border-slate-100 dark:border-slate-700">
              {[
                ['Duration', `${leaveModal.item.from} → ${leaveModal.item.to}`],
                ['Days', `${leaveModal.item.days} working day${leaveModal.item.days > 1 ? 's' : ''}`],
                ['Reason', leaveModal.item.reason],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <span className="text-slate-400 dark:text-slate-500 flex-shrink-0">{k}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* ══ EMPLOYEE PROFILE MODAL ══ */}
      <Modal isOpen={!!selectedEmp} onClose={() => setSelectedEmp(null)} title="Employee Profile" size="md"
        footer={<Button variant="secondary" onClick={() => setSelectedEmp(null)}>Close</Button>}
      >
        {selectedEmp && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/40">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-indigo-500/25 flex-shrink-0">
                {selectedEmp.avatar}
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedEmp.name}</p>
                <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold">{selectedEmp.designation}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge status={selectedEmp.status.toLowerCase()}>{selectedEmp.status}</Badge>
                  <span className="capitalize text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">{selectedEmp.role}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                ['Department',  selectedEmp.department],
                ['Email',       selectedEmp.email],
                ['Phone',       selectedEmp.phone],
                ['Location',    selectedEmp.location],
                ['Join Date',   selectedEmp.joinDate],
                ['Reports To',  selectedEmp.manager || '—'],
                ['Annual CTC',  `₹${(selectedEmp.salary * 12).toLocaleString('en-IN')}`],
                ['Monthly',     `₹${selectedEmp.salary.toLocaleString('en-IN')}`],
              ].map(([k, v]) => (
                <div key={k} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">{k}</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{v}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
