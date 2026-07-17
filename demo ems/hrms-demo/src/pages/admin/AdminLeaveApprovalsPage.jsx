import { useState } from 'react';
import { CheckCircle, XCircle, Clock, Filter, Search, X } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import { useToast, ToastContainer } from '../../components/ui/Toast';
import { pendingLeaveApprovals, leaveTypes } from '../../data/leaves';

// Admin sees ALL leave requests across all levels
const allLeaveRequests = [
  ...pendingLeaveApprovals.map(r => ({ ...r, actionStatus: 'pending' })),
  // Additional leave requests visible to admin
  { id: 9,  employeeId: 11, employeeName: 'Suresh Babu',    avatar: 'SB', designation: 'Finance Analyst',     type: 'Casual Leave',    from: '2025-07-23', to: '2025-07-23', days: 1, reason: 'Bank work',          appliedOn: '2025-07-16', level: 'manager',  actionStatus: 'pending' },
  { id: 10, employeeId: 14, employeeName: 'Anjali Rao',     avatar: 'AR', designation: 'Marketing Specialist', type: 'Sick Leave',      from: '2025-07-18', to: '2025-07-19', days: 2, reason: 'Not feeling well', appliedOn: '2025-07-15', level: 'teamlead', actionStatus: 'pending' },
  { id: 11, employeeId: 8,  employeeName: 'Nisha Gupta',    avatar: 'NG', designation: 'UX Designer',          type: 'Earned Leave',    from: '2025-08-04', to: '2025-08-08', days: 5, reason: 'Family trip',        appliedOn: '2025-07-14', level: 'manager',  actionStatus: 'pending' },
  { id: 12, employeeId: 10, employeeName: 'Meera Krishnan', avatar: 'MK', designation: 'HR Executive',         type: 'Casual Leave',    from: '2025-07-25', to: '2025-07-25', days: 1, reason: 'Personal work',      appliedOn: '2025-07-16', level: 'teamlead', actionStatus: 'pending' },
];

const LEVEL_LABELS = { teamlead: 'Team Lead Level', manager: 'Manager Level' };

export default function AdminLeaveApprovalsPage() {
  const { toasts, removeToast, toast } = useToast();
  const [items, setItems] = useState(allLeaveRequests);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [actionModal, setActionModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const filtered = items.filter(item => {
    const q = search.toLowerCase();
    const matchSearch = !q || item.employeeName.toLowerCase().includes(q) || item.designation.toLowerCase().includes(q);
    const matchType = !filterType || item.type === filterType;
    const matchStatus = !filterStatus || item.actionStatus === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const pendingCount = items.filter(i => i.actionStatus === 'pending').length;
  const approvedCount = items.filter(i => i.actionStatus === 'approved').length;
  const rejectedCount = items.filter(i => i.actionStatus === 'rejected').length;

  const openAction = (type, item) => {
    setRejectReason('');
    setActionModal({ type, item });
  };

  const confirmAction = () => {
    const { type, item } = actionModal;
    setItems(prev => prev.map(a =>
      a.id === item.id ? { ...a, actionStatus: type === 'approve' ? 'approved' : 'rejected' } : a
    ));
    toast(
      type === 'approve'
        ? `Leave approved for ${item.employeeName}`
        : `Leave rejected for ${item.employeeName}`,
      type === 'approve' ? 'success' : 'error'
    );
    setActionModal(null);
  };

  const bulkApproveAll = () => {
    setItems(prev => prev.map(i => i.actionStatus === 'pending' ? { ...i, actionStatus: 'approved' } : i));
    toast(`All ${pendingCount} pending leaves approved`, 'success');
  };

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Leave Approvals</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
            Admin · All employees · {items.length} total requests
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <Button variant="success" size="sm" icon={CheckCircle} onClick={bulkApproveAll}>
              Approve All ({pendingCount})
            </Button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', count: pendingCount,  color: 'amber',   icon: Clock },
          { label: 'Approved', count: approvedCount, color: 'emerald', icon: CheckCircle },
          { label: 'Rejected', count: rejectedCount, color: 'red',     icon: XCircle },
        ].map(({ label, count, color, icon: Icon }) => (
          <div key={label} className={`bg-${color}-50 dark:bg-${color}-900/20 border border-${color}-200 dark:border-${color}-800/40 rounded-2xl p-4 flex items-center gap-3`}>
            <div className={`w-10 h-10 rounded-xl bg-${color}-100 dark:bg-${color}-900/40 flex items-center justify-center`}>
              <Icon size={18} className={`text-${color}-600 dark:text-${color}-400`} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{count}</p>
              <p className={`text-xs font-semibold text-${color}-700 dark:text-${color}-400`}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by employee or designation…"
              className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm
                bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none
                focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600 dark:placeholder-slate-500"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600"
          >
            <option value="">All Leave Types</option>
            {leaveTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          {(search || filterType || filterStatus) && (
            <button
              onClick={() => { setSearch(''); setFilterType(''); setFilterStatus(''); }}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-500 transition-colors"
            >
              <X size={13} /> Clear filters
            </button>
          )}
        </div>
      </Card>

      {/* Leave request list */}
      {filtered.length === 0 ? (
        <Card>
          <div className="py-16 text-center">
            <CheckCircle size={40} className="mx-auto mb-3 text-emerald-400" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No leave requests found.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <Card key={item.id}>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <Avatar initials={item.avatar} size="lg" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-900 dark:text-white">{item.employeeName}</p>
                      <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">
                        {LEVEL_LABELS[item.level]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.designation}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Badge status={item.type.toLowerCase()}>{item.type}</Badge>
                      <Badge status={item.actionStatus}>{item.actionStatus}</Badge>
                      <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                        {item.from} → {item.to} · {item.days} day{item.days > 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 italic">"{item.reason}"</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Applied: {item.appliedOn}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0 items-end">
                  {item.actionStatus === 'pending' ? (
                    <>
                      <Button variant="success" size="sm" icon={CheckCircle} onClick={() => openAction('approve', item)}>
                        Approve
                      </Button>
                      <Button variant="danger" size="sm" icon={XCircle} onClick={() => openAction('reject', item)}>
                        Reject
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col items-end gap-1.5">
                      <Badge status={item.actionStatus}>
                        {item.actionStatus === 'approved' ? '✓ Approved' : '✗ Rejected'}
                      </Badge>
                      <button
                        onClick={() => setItems(prev => prev.map(i => i.id === item.id ? { ...i, actionStatus: 'pending' } : i))}
                        className="text-xs text-slate-400 hover:text-indigo-600 underline transition-colors"
                      >
                        Undo
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Action confirm modal */}
      <Modal
        isOpen={!!actionModal}
        onClose={() => setActionModal(null)}
        title={actionModal?.type === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setActionModal(null)}>Cancel</Button>
            <Button
              variant={actionModal?.type === 'approve' ? 'success' : 'danger'}
              onClick={confirmAction}
            >
              {actionModal?.type === 'approve' ? 'Yes, Approve' : 'Yes, Reject'}
            </Button>
          </>
        }
      >
        {actionModal && (
          <div className="space-y-3">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {actionModal.type === 'approve' ? 'Approve' : 'Reject'} leave request for{' '}
              <strong>{actionModal.item.employeeName}</strong>?
            </p>
            <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Type</span>
                <span className="font-semibold">{actionModal.item.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Duration</span>
                <span className="font-semibold">{actionModal.item.from} → {actionModal.item.to}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Days</span>
                <span className="font-semibold">{actionModal.item.days} day{actionModal.item.days > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Reason</span>
                <span className="font-semibold text-right max-w-[160px]">{actionModal.item.reason}</span>
              </div>
            </div>
            {actionModal.type === 'reject' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Rejection Reason (optional)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  rows={2}
                  placeholder="Briefly explain the reason…"
                  className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm
                    bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none
                    focus:ring-2 focus:ring-red-300 dark:focus:ring-red-600 resize-none dark:placeholder-slate-500"
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
