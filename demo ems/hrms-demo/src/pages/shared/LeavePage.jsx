import { useState } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import { useToast, ToastContainer } from '../../components/ui/Toast';
import { PlusCircle } from 'lucide-react';
import { leaveBalance as initialBalance, myLeaveRequests, leaveTypes } from '../../data/leaves';

function calcDays(from, to) {
  if (!from || !to) return 0;
  const d1 = new Date(from), d2 = new Date(to);
  if (d2 < d1) return 0;
  let count = 0, cur = new Date(d1);
  while (cur <= d2) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

export default function LeavePage() {
  const { toasts, removeToast, toast } = useToast();
  const [leaveModal, setLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ type: '', from: '', to: '', reason: '' });
  const [leaveRequests, setLeaveRequests] = useState(myLeaveRequests);
  const [balance, setBalance] = useState(initialBalance);

  const computedDays = calcDays(leaveForm.from, leaveForm.to);

  const submitLeave = () => {
    if (!leaveForm.type || !leaveForm.from || !leaveForm.to) {
      toast('Please fill all required fields', 'error');
      return;
    }
    if (computedDays === 0) {
      toast('Invalid date range', 'error');
      return;
    }
    setLeaveRequests(prev => [{
      id: prev.length + 1,
      type: leaveForm.type,
      from: leaveForm.from,
      to: leaveForm.to,
      days: computedDays,
      status: 'pending',
      appliedOn: new Date().toISOString().split('T')[0],
      approvedBy: null,
    }, ...prev]);
    setLeaveModal(false);
    setLeaveForm({ type: '', from: '', to: '', reason: '' });
    toast(`Leave applied for ${computedDays} working day${computedDays > 1 ? 's' : ''}`, 'success');
  };

  const columns = [
    { key: 'type', label: 'Leave Type' },
    { key: 'from', label: 'From' },
    { key: 'to', label: 'To' },
    { key: 'days', label: 'Days', render: v => `${v}d` },
    { key: 'status', label: 'Status', render: v => <Badge status={v} /> },
    { key: 'appliedOn', label: 'Applied On' },
    { key: 'approvedBy', label: 'Approved By', render: v => v || <span className="text-slate-400 dark:text-slate-500 text-xs">Pending</span> },
  ];

  const inputCls = 'w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200';

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Leave Management</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">Track your leaves and balances</p>
        </div>
        <Button variant="primary" icon={PlusCircle} onClick={() => setLeaveModal(true)}>Apply Leave</Button>
      </div>

      {/* Leave balance cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { type: 'casual', label: 'Casual Leave', color: 'indigo' },
          { type: 'sick',   label: 'Sick Leave',   color: 'rose' },
          { type: 'earned', label: 'Earned Leave', color: 'emerald' },
        ].map(({ type, label, color }) => {
          const b = balance[type];
          const pct = b.total > 0 ? Math.round((b.remaining / b.total) * 100) : 0;
          return (
            <div key={type} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{b.remaining}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">of {b.total} days remaining · {b.used} used</p>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mt-3">
                <div className={`h-1.5 rounded-full bg-${color}-500 transition-all duration-500`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Leave requests table */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Leave Requests</h3>
          <span className="text-xs text-slate-400">{leaveRequests.length} requests</span>
        </div>
        <Table columns={columns} data={leaveRequests} />
      </Card>

      {/* Apply Leave Modal */}
      <Modal isOpen={leaveModal} onClose={() => setLeaveModal(false)} title="Apply for Leave"
        footer={
          <>
            <Button variant="secondary" onClick={() => setLeaveModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={submitLeave}>Submit Request</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Leave Type *</label>
            <select value={leaveForm.type} onChange={e => setLeaveForm({...leaveForm, type: e.target.value})} className={inputCls}>
              <option value="">Select leave type</option>
              {leaveTypes.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">From *</label>
              <input type="date" value={leaveForm.from} onChange={e => setLeaveForm({...leaveForm, from: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">To *</label>
              <input type="date" value={leaveForm.to} onChange={e => setLeaveForm({...leaveForm, to: e.target.value})} className={inputCls} />
            </div>
          </div>
          {computedDays > 0 && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/40 rounded-lg px-4 py-2 text-xs text-indigo-700 dark:text-indigo-400 font-semibold">
              📅 {computedDays} working day{computedDays > 1 ? 's' : ''} selected
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Reason</label>
            <textarea value={leaveForm.reason} onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})} rows={3} placeholder="Brief reason for leave..." className={`${inputCls} resize-none`} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
