import { useState } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import { useToast, ToastContainer } from '../../components/ui/Toast';
import { pendingLeaveApprovals } from '../../data/leaves';

export default function LeaveApprovalsPage({ role }) {
  const level = role === 'teamlead' ? 'teamlead' : 'manager';
  const { toasts, removeToast, toast } = useToast();

  // Track statuses: pending / approved / rejected
  const [items, setItems] = useState(
    pendingLeaveApprovals.filter(a => a.level === level).map(a => ({ ...a, actionStatus: 'pending' }))
  );
  const [actionModal, setActionModal] = useState(null);

  const pendingCount = items.filter(a => a.actionStatus === 'pending').length;

  const confirmAction = () => {
    const { type, item } = actionModal;
    setItems(prev => prev.map(a => a.id === item.id ? { ...a, actionStatus: type === 'approve' ? 'approved' : 'rejected' } : a));
    toast(
      type === 'approve'
        ? `Leave approved for ${item.employeeName}`
        : `Leave rejected for ${item.employeeName}`,
      type === 'approve' ? 'success' : 'error'
    );
    setActionModal(null);
  };

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Leave Approvals</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
            {level === 'teamlead' ? 'First-level' : 'Final manager'} approval queue · {pendingCount} pending
          </p>
        </div>
        {pendingCount > 0 && (
          <span className="inline-flex items-center gap-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold px-3 py-1.5 rounded-full border border-red-200 dark:border-red-700">
            <Clock size={12} /> {pendingCount} pending
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <Card>
          <div className="py-16 text-center">
            <CheckCircle size={40} className="mx-auto mb-3 text-emerald-400" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No leave requests assigned to you.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <Card key={item.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar initials={item.avatar} size="lg" />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{item.employeeName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.designation}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Badge status={item.actionStatus === 'pending' ? 'pending' : item.actionStatus}>{item.type}</Badge>
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
                      <Button variant="success" size="sm" icon={CheckCircle} onClick={() => setActionModal({ type: 'approve', item })}>Approve</Button>
                      <Button variant="danger" size="sm" icon={XCircle} onClick={() => setActionModal({ type: 'reject', item })}>Reject</Button>
                    </>
                  ) : (
                    <Badge status={item.actionStatus}>
                      {item.actionStatus === 'approved' ? '✓ Approved' : '✗ Rejected'}
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

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
              <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Type</span><span className="font-semibold">{actionModal.item.type}</span></div>
              <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Duration</span><span className="font-semibold">{actionModal.item.from} → {actionModal.item.to}</span></div>
              <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Days</span><span className="font-semibold">{actionModal.item.days} working day{actionModal.item.days > 1 ? 's' : ''}</span></div>
              <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Reason</span><span className="font-semibold text-right max-w-32">{actionModal.item.reason}</span></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
