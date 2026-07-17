import { useState } from 'react';
import { Users, Search, UserPlus, UserMinus, DollarSign, ChevronRight, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
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
import { onboardingCandidates as initOnboarding, offboardingCandidates as initOffboarding, orgStats } from '../../data/analytics';
import { pendingLeaveApprovals } from '../../data/leaves';

const STAGES = ['documents_pending', 'verification', 'completed'];
const stageLabels = { documents_pending: 'Documents Pending', verification: 'Verification', completed: 'Completed' };
const stageColors = {
  documents_pending: 'bg-amber-50  dark:bg-amber-900/20  border-amber-200  dark:border-amber-700  text-amber-700  dark:text-amber-400',
  verification:      'bg-blue-50   dark:bg-blue-900/20   border-blue-200   dark:border-blue-700   text-blue-700   dark:text-blue-400',
  completed:         'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400',
};

function KanbanCard({ person, isOffboarding, onAdvance, isLast }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar initials={person.avatar} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{person.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{person.designation}</p>
          </div>
        </div>
        {!isLast && (
          <button onClick={() => onAdvance(person.id)}
            className="flex-shrink-0 ml-2 p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
            title="Move to next stage"
          >
            <ArrowRight size={12} />
          </button>
        )}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{person.department}</p>
      <p className="text-[11px] text-slate-400 dark:text-slate-500">
        {isOffboarding ? `Last day: ${person.lastDay}` : `Joining: ${person.joinDate}`}
        {isOffboarding && person.reason ? ` · ${person.reason}` : ''}
      </p>
    </div>
  );
}

export default function HRDashboard({ user, defaultTab }) {
  const { toasts, removeToast, toast } = useToast();

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTab, setActiveTab] = useState(defaultTab || 'directory');

  // Payroll
  const [payrollProcessed, setPayrollProcessed] = useState(false);
  const [payrollModalOpen, setPayrollModalOpen] = useState(false);

  // Employee view
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Kanban boards — moveable
  const [onboardingList, setOnboardingList] = useState(initOnboarding);
  const [offboardingList, setOffboardingList] = useState(initOffboarding);

  // Leave management actions
  const [leaveItems, setLeaveItems] = useState(
    pendingLeaveApprovals.map(a => ({ ...a, actionStatus: 'pending' }))
  );
  const [leaveActionModal, setLeaveActionModal] = useState(null);

  const advanceOnboarding = (id) => {
    setOnboardingList(prev => prev.map(p => {
      if (p.id !== id) return p;
      const idx = STAGES.indexOf(p.stage);
      const next = STAGES[idx + 1];
      toast(`${p.name} moved to ${stageLabels[next]}`, 'success');
      return { ...p, stage: next };
    }));
  };

  const advanceOffboarding = (id) => {
    setOffboardingList(prev => prev.map(p => {
      if (p.id !== id) return p;
      const idx = STAGES.indexOf(p.stage);
      const next = STAGES[idx + 1];
      toast(`${p.name} moved to ${stageLabels[next]}`, 'success');
      return { ...p, stage: next };
    }));
  };

  const confirmLeaveAction = () => {
    const { type, item } = leaveActionModal;
    setLeaveItems(prev => prev.map(a =>
      a.id === item.id ? { ...a, actionStatus: type === 'approve' ? 'approved' : 'rejected' } : a
    ));
    toast(
      type === 'approve' ? `Leave approved for ${item.employeeName}` : `Leave rejected for ${item.employeeName}`,
      type === 'approve' ? 'success' : 'error'
    );
    setLeaveActionModal(null);
  };

  const filtered = employees.filter(e => {
    const q = search.toLowerCase();
    return (
      (!search || e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.designation.toLowerCase().includes(q)) &&
      (!deptFilter || e.department === deptFilter) &&
      (!statusFilter || e.status.toLowerCase() === statusFilter.toLowerCase())
    );
  });

  const tabs = [
    { id: 'directory',  label: 'Employees',        count: employees.length },
    { id: 'onboarding', label: 'Onboarding',        count: onboardingList.length },
    { id: 'offboarding',label: 'Offboarding',       count: offboardingList.length },
    { id: 'payroll',    label: 'Payroll',            count: null },
    { id: 'leaves',     label: 'Leave Management',  count: leaveItems.filter(a => a.actionStatus === 'pending').length },
  ];

  const empColumns = [
    { key: 'name', label: 'Employee', render: (v, row) => (
      <div className="flex items-center gap-2.5">
        <Avatar initials={row.avatar} size="sm" />
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{v}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{row.email}</p>
        </div>
      </div>
    )},
    { key: 'designation', label: 'Designation' },
    { key: 'department',  label: 'Department' },
    { key: 'location',    label: 'Location' },
    { key: 'joinDate',    label: 'Joined' },
    { key: 'status', label: 'Status', render: v => <Badge status={v.toLowerCase()} /> },
    { key: 'id', label: '', render: (_, row) => (
      <Button variant="ghost" size="xs" onClick={() => setSelectedEmployee(row)}>View <ChevronRight size={12} /></Button>
    )},
  ];

  const payrollColumns = [
    { key: 'name', label: 'Employee', render: (v, row) => (
      <div className="flex items-center gap-2.5">
        <Avatar initials={row.avatar} size="sm" />
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{v}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{row.designation}</p>
        </div>
      </div>
    )},
    { key: 'basic',           label: 'Basic',     render: v => `₹${v.toLocaleString('en-IN')}` },
    { key: 'gross',           label: 'Gross',     render: v => `₹${v.toLocaleString('en-IN')}` },
    { key: 'pf',              label: 'PF',        render: v => `₹${v.toLocaleString('en-IN')}` },
    { key: 'tds',             label: 'TDS',       render: v => `₹${v.toLocaleString('en-IN')}` },
    { key: 'net_pay',         label: 'Net Pay',   render: v => <span className="font-bold text-slate-900 dark:text-white">₹{v.toLocaleString('en-IN')}</span> },
    { key: 'status',          label: 'Status',    render: v => <Badge status={payrollProcessed ? 'processed' : v} /> },
  ];

  const leaveColumns = [
    { key: 'employeeName', label: 'Employee', render: (v, row) => (
      <div className="flex items-center gap-2">
        <Avatar initials={row.avatar} size="sm" />
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{v}</span>
      </div>
    )},
    { key: 'type',  label: 'Leave Type' },
    { key: 'from',  label: 'From' },
    { key: 'to',    label: 'To' },
    { key: 'days',  label: 'Days', render: v => `${v}d` },
    { key: 'actionStatus', label: 'Status', render: v => <Badge status={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</Badge> },
    { key: 'id', label: 'Action', render: (_, row) => (
      row.actionStatus === 'pending' ? (
        <div className="flex gap-1.5">
          <Button variant="success" size="xs" icon={CheckCircle} onClick={() => setLeaveActionModal({ type: 'approve', item: row })}>Approve</Button>
          <Button variant="danger"  size="xs" icon={XCircle}      onClick={() => setLeaveActionModal({ type: 'reject',  item: row })}>Reject</Button>
        </div>
      ) : (
        <span className="text-xs text-slate-400">Done</span>
      )
    )},
  ];

  const inputCls = 'w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200';

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">HR Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Deepiotics Private Limited · People Operations</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employees"  value={orgStats.totalEmployees}    subtitle="All departments"         icon={Users}    color="indigo" />
        <StatCard title="Active Today"     value={orgStats.activeToday}        subtitle={`${orgStats.attendancePercent}% attendance`} icon={UserPlus}  color="emerald" />
        <StatCard title="On Leave Today"   value={orgStats.onLeaveToday}       subtitle="Approved absences"      icon={UserMinus} color="amber" />
        <StatCard title="Open Positions"   value={orgStats.openPositions}      subtitle="Hiring in progress"     icon={Users}    color="blue" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-150 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
            {tab.count !== null && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === tab.id
                  ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Employee Directory ── */}
      {activeTab === 'directory' && (
        <Card padding={false}>
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, designation..."
                className={`${inputCls} pl-8`} />
            </div>
            <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className={inputCls + ' w-auto'}>
              <option value="">All Departments</option>
              {departments.map(d => <option key={d}>{d}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={inputCls + ' w-auto'}>
              <option value="">All Status</option>
              <option>Active</option><option>Inactive</option><option>On Leave</option>
            </select>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
          </div>
          <Table columns={empColumns} data={filtered} emptyMessage="No employees match your filters" />
        </Card>
      )}

      {/* ── Onboarding Kanban ── */}
      {activeTab === 'onboarding' && (
        <div className="grid grid-cols-3 gap-5">
          {STAGES.map(stage => (
            <div key={stage}>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-bold mb-3 ${stageColors[stage]}`}>
                {stageLabels[stage]}
                <span className="ml-1 opacity-60">({onboardingList.filter(c => c.stage === stage).length})</span>
              </div>
              <div className="space-y-3 min-h-24">
                {onboardingList.filter(c => c.stage === stage).map(c => (
                  <KanbanCard key={c.id} person={c}
                    onAdvance={advanceOnboarding}
                    isLast={stage === 'completed'}
                  />
                ))}
                {onboardingList.filter(c => c.stage === stage).length === 0 && (
                  <div className="text-xs text-slate-400 dark:text-slate-500 text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                    No candidates
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Offboarding Kanban ── */}
      {activeTab === 'offboarding' && (
        <div className="grid grid-cols-3 gap-5">
          {STAGES.map(stage => (
            <div key={stage}>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-bold mb-3 ${stageColors[stage]}`}>
                {stageLabels[stage]}
                <span className="ml-1 opacity-60">({offboardingList.filter(c => c.stage === stage).length})</span>
              </div>
              <div className="space-y-3 min-h-24">
                {offboardingList.filter(c => c.stage === stage).map(c => (
                  <KanbanCard key={c.id} person={c} isOffboarding
                    onAdvance={advanceOffboarding}
                    isLast={stage === 'completed'}
                  />
                ))}
                {offboardingList.filter(c => c.stage === stage).length === 0 && (
                  <div className="text-xs text-slate-400 dark:text-slate-500 text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                    No candidates
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Payroll ── */}
      {activeTab === 'payroll' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Payroll — July 2025</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {payrollProcessed
                  ? '✓ Payroll processed and disbursed'
                  : 'Review and process salary for all eligible employees'}
              </p>
            </div>
            <Button variant="primary" icon={DollarSign} onClick={() => setPayrollModalOpen(true)} disabled={payrollProcessed}>
              {payrollProcessed ? '✓ Processed' : 'Process Payroll'}
            </Button>
          </div>
          <Card padding={false}>
            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {payrollTable.length} Employees
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Total Net: ₹{payrollTable.reduce((s, e) => s + e.net_pay, 0).toLocaleString('en-IN')}
              </span>
            </div>
            <Table columns={payrollColumns} data={payrollTable} />
          </Card>
        </div>
      )}

      {/* ── Leave Management ── */}
      {activeTab === 'leaves' && (
        <Card padding={false}>
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Organization-wide Leave Requests</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {leaveItems.filter(a => a.actionStatus === 'pending').length} pending · {leaveItems.filter(a => a.actionStatus === 'approved').length} approved · {leaveItems.filter(a => a.actionStatus === 'rejected').length} rejected
              </p>
            </div>
          </div>
          <Table columns={leaveColumns} data={leaveItems} />
        </Card>
      )}

      {/* ── Process Payroll Modal ── */}
      <Modal isOpen={payrollModalOpen} onClose={() => setPayrollModalOpen(false)} title="Process Payroll — July 2025" size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPayrollModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => {
              setPayrollProcessed(true);
              setPayrollModalOpen(false);
              toast('✓ Payroll for July 2025 processed successfully!', 'success');
            }}>Confirm & Process</Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Processing payroll for <strong>{payrollTable.length} employees</strong> for July 2025.
          </p>
          <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Total Gross</span>
              <span className="font-semibold">₹{payrollTable.reduce((s, e) => s + e.gross, 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Total Deductions</span>
              <span className="font-semibold text-red-500">₹{payrollTable.reduce((s, e) => s + e.total_deductions, 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 dark:border-slate-600 pt-2">
              <span className="font-bold text-slate-800 dark:text-slate-200">Total Net Pay</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{payrollTable.reduce((s, e) => s + e.net_pay, 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3 text-xs text-amber-700 dark:text-amber-400">
            ⚠️ This action cannot be undone for the current cycle.
          </div>
        </div>
      </Modal>

      {/* ── Leave Action Confirm Modal ── */}
      <Modal isOpen={!!leaveActionModal} onClose={() => setLeaveActionModal(null)}
        title={leaveActionModal?.type === 'approve' ? 'Approve Leave' : 'Reject Leave'}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setLeaveActionModal(null)}>Cancel</Button>
            <Button variant={leaveActionModal?.type === 'approve' ? 'success' : 'danger'} onClick={confirmLeaveAction}>
              {leaveActionModal?.type === 'approve' ? 'Yes, Approve' : 'Yes, Reject'}
            </Button>
          </>
        }
      >
        {leaveActionModal && (
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {leaveActionModal.type === 'approve' ? 'Approve' : 'Reject'} <strong>{leaveActionModal.item.type}</strong> for{' '}
            <strong>{leaveActionModal.item.employeeName}</strong> ({leaveActionModal.item.from} → {leaveActionModal.item.to})?
          </p>
        )}
      </Modal>

      {/* ── Employee Profile Modal ── */}
      <Modal isOpen={!!selectedEmployee} onClose={() => setSelectedEmployee(null)} title="Employee Profile" size="sm"
        footer={<Button variant="secondary" onClick={() => setSelectedEmployee(null)}>Close</Button>}
      >
        {selectedEmployee && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
              <Avatar initials={selectedEmployee.avatar} size="xl" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">{selectedEmployee.name}</h3>
                <p className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold">{selectedEmployee.designation}</p>
                <Badge status={selectedEmployee.status.toLowerCase()} className="mt-1.5">{selectedEmployee.status}</Badge>
              </div>
            </div>
            <div className="space-y-0">
              {[
                ['Department',  selectedEmployee.department],
                ['Email',       selectedEmployee.email],
                ['Phone',       selectedEmployee.phone],
                ['Location',    selectedEmployee.location],
                ['Join Date',   selectedEmployee.joinDate],
                ['Reports To',  selectedEmployee.manager || '—'],
                ['CTC',         `₹${(selectedEmployee.salary * 12).toLocaleString('en-IN')} / yr`],
                ['Monthly',     `₹${selectedEmployee.salary.toLocaleString('en-IN')}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{k}</span>
                  <span className="text-xs text-slate-900 dark:text-white font-semibold text-right max-w-48 break-words">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
