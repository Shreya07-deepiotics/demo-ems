import { useState } from 'react';
import { Users, UserCheck, UserX, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import { useToast, ToastContainer } from '../../components/ui/Toast';
import { teamAttendanceToday } from '../../data/attendance';
import { pendingLeaveApprovals } from '../../data/leaves';
import { employees } from '../../data/employees';

const teamMembers = employees.filter(e => e.teamLead === 'Rohit Verma');

export default function TeamLeadDashboard({ user }) {
  const { toasts, removeToast, toast } = useToast();
  const [approvals, setApprovals] = useState(
    pendingLeaveApprovals.filter(a => a.level === 'teamlead').map(a => ({ ...a, actionStatus: 'pending' }))
  );
  const [selectedMember, setSelectedMember] = useState(null);
  const [actionModal, setActionModal] = useState(null);

  const presentToday = teamAttendanceToday.filter(e => e.status === 'present').length;
  const absentToday  = teamAttendanceToday.filter(e => e.status === 'absent').length;
  const pendingCount = approvals.filter(a => a.actionStatus === 'pending').length;

  const confirmAction = () => {
    const { type, item } = actionModal;
    setApprovals(prev => prev.map(a =>
      a.id === item.id ? { ...a, actionStatus: type === 'approve' ? 'approved' : 'rejected' } : a
    ));
    toast(
      type === 'approve'
        ? `✓ Leave approved for ${item.employeeName}`
        : `✗ Leave rejected for ${item.employeeName}`,
      type === 'approve' ? 'success' : 'error'
    );
    setActionModal(null);
  };

  const attendanceColumns = [
    { key: 'name', label: 'Employee', render: (v, row) => (
      <div className="flex items-center gap-2.5">
        <Avatar initials={row.avatar} size="sm" />
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{v}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{row.designation}</p>
        </div>
      </div>
    )},
    { key: 'status', label: 'Status', render: v => <Badge status={v} /> },
  ];

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Team Lead Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Welcome back, {user?.name?.split(' ')[0]}</p>
        </div>
        {pendingCount > 0 && (
          <span className="inline-flex items-center gap-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold px-3 py-1.5 rounded-full border border-red-200 dark:border-red-700">
            <Clock size={12} /> {pendingCount} approval{pendingCount > 1 ? 's' : ''} pending
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Team Size"         value={teamMembers.length} subtitle="Direct reports"    icon={Users}      color="indigo" />
        <StatCard title="Present Today"     value={presentToday}       subtitle="In office / WFH"  icon={UserCheck}  color="emerald" />
        <StatCard title="On Leave Today"    value={absentToday}        subtitle="Approved leaves"  icon={UserX}      color="amber" />
        <StatCard title="Pending Approvals" value={pendingCount}        subtitle="Awaiting action"  icon={Clock}      color="red" />
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Today's attendance */}
        <div className="col-span-12 lg:col-span-7">
          <Card padding={false}>
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Today's Attendance</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">July 16, 2025</p>
            </div>
            <Table columns={attendanceColumns} data={teamAttendanceToday} />
          </Card>
        </div>

        {/* Team members list */}
        <div className="col-span-12 lg:col-span-5">
          <Card>
            <CardHeader title="Team Members" subtitle={`${teamMembers.length} members`} icon={Users} />
            <div className="space-y-2">
              {teamMembers.map(member => (
                <div key={member.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer" onClick={() => setSelectedMember(member)}>
                  <div className="flex items-center gap-2.5">
                    <Avatar initials={member.avatar} size="sm" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{member.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{member.designation}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="xs" icon={Eye} onClick={e => { e.stopPropagation(); setSelectedMember(member); }}>View</Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Leave approvals */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Leave Approvals</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">First-level approval · {pendingCount} pending</p>
          </div>
          {pendingCount > 0 && (
            <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{pendingCount}</span>
          )}
        </div>

        {approvals.length === 0 ? (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
            <CheckCircle size={32} className="mx-auto mb-2 text-emerald-400" />
            No leave requests assigned.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {approvals.map(item => (
              <div key={item.id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar initials={item.avatar} size="md" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{item.employeeName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.designation}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge status={item.actionStatus === 'pending' ? 'pending' : item.actionStatus}>{item.type}</Badge>
                      <span className="text-xs text-slate-600 dark:text-slate-300">{item.from} → {item.to} · {item.days}d</span>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 italic">"{item.reason}"</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0 ml-4 items-end">
                  {item.actionStatus === 'pending' ? (
                    <>
                      <Button variant="success" size="sm" icon={CheckCircle} onClick={() => setActionModal({ type: 'approve', item })}>Approve</Button>
                      <Button variant="danger"  size="sm" icon={XCircle}      onClick={() => setActionModal({ type: 'reject',  item })}>Reject</Button>
                    </>
                  ) : (
                    <Badge status={item.actionStatus}>
                      {item.actionStatus === 'approved' ? '✓ Approved' : '✗ Rejected'}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Member profile modal */}
      <Modal isOpen={!!selectedMember} onClose={() => setSelectedMember(null)} title="Team Member Profile" size="sm"
        footer={<Button variant="secondary" onClick={() => setSelectedMember(null)}>Close</Button>}
      >
        {selectedMember && (
          <div className="text-center space-y-4">
            <Avatar initials={selectedMember.avatar} size="xl" className="mx-auto" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">{selectedMember.name}</h3>
              <p className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold">{selectedMember.designation}</p>
              <Badge status="active" className="mt-2">Active</Badge>
            </div>
            <div className="text-left bg-slate-50 dark:bg-slate-700 rounded-xl p-4 space-y-2.5">
              {[
                ['Department', selectedMember.department],
                ['Email',      selectedMember.email],
                ['Phone',      selectedMember.phone],
                ['Location',   selectedMember.location],
                ['Joined',     selectedMember.joinDate],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-4">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{k}</span>
                  <span className="text-xs text-slate-800 dark:text-slate-200 font-semibold text-right">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Action confirmation modal */}
      <Modal
        isOpen={!!actionModal}
        onClose={() => setActionModal(null)}
        title={actionModal?.type === 'approve' ? 'Approve Leave' : 'Reject Leave'}
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
              <strong className="text-slate-900 dark:text-white">{actionModal.item.employeeName}</strong>?
            </p>
            <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Type</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{actionModal.item.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Duration</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{actionModal.item.from} → {actionModal.item.to}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Days</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{actionModal.item.days} day{actionModal.item.days > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Reason</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-right max-w-40">{actionModal.item.reason}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
