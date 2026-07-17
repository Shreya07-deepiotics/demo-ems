import { useState, useRef } from 'react';
import { Users, TrendingUp, CheckCircle, XCircle, Star, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Card, { CardHeader } from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import { useToast, ToastContainer } from '../../components/ui/Toast';
import { pendingLeaveApprovals } from '../../data/leaves';
import { teamAppraisals as initialAppraisals, performanceChartData } from '../../data/appraisals';
import { teamAttendanceToday } from '../../data/attendance';
import { employees } from '../../data/employees';

const teamMembers = employees.filter(e => e.department === 'Finance');

const calendarData = [
  { date: 1, status: null }, { date: 2, status: null }, { date: 3, status: null },
  { date: 4, status: 'leave', who: 'Arjun' }, { date: 5, status: null },
  { date: 7, status: null }, { date: 8, status: null }, { date: 9, status: null },
  { date: 10, status: null }, { date: 11, status: null },
  { date: 12, status: null }, { date: 14, status: 'leave', who: 'Nisha' },
  { date: 15, status: null }, { date: 16, status: null }, { date: 17, status: 'leave', who: 'Kavya' },
  { date: 18, status: null }, { date: 19, status: null },
  { date: 21, status: null }, { date: 22, status: 'leave', who: 'Rahul' },
];

export default function ManagerDashboard({ user }) {
  const { toasts, removeToast, toast } = useToast();
  const [approvals, setApprovals] = useState(
    pendingLeaveApprovals.filter(a => a.level === 'manager').map(a => ({ ...a, actionStatus: 'pending' }))
  );
  const [actionModal, setActionModal] = useState(null);
  const [appraisalModal, setAppraisalModal] = useState(null);
  const [teamAppraisals, setTeamAppraisals] = useState(initialAppraisals);
  const ratingRef = useRef(null);
  const feedbackRef = useRef(null);

  const confirmAction = () => {
    const { type, item } = actionModal;
    setApprovals(prev => prev.map(a => a.id === item.id ? { ...a, actionStatus: type === 'approve' ? 'approved' : 'rejected' } : a));
    toast(type === 'approve' ? `Leave approved for ${item.employeeName}` : `Leave rejected for ${item.employeeName}`, type === 'approve' ? 'success' : 'error');
    setActionModal(null);
  };

  const saveRating = () => {
    const ratingVal = parseFloat(ratingRef.current?.value);
    if (!ratingVal || ratingVal < 1 || ratingVal > 5) {
      toast('Please enter a valid rating between 1 and 5', 'error');
      return;
    }
    setTeamAppraisals(prev => prev.map(m => m.id === appraisalModal.id
      ? { ...m, managerRating: ratingVal, status: 'Completed' }
      : m
    ));
    toast(`Rating ${ratingVal}/5 saved for ${appraisalModal.name}`, 'success');
    setAppraisalModal(null);
  };

  const pendingLeaveCount = approvals.filter(a => a.actionStatus === 'pending').length;
  const presentToday = teamAttendanceToday.filter(e => e.status === 'present').length;

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Finance Manager Dashboard</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">Finance Department · {user?.name}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Team Size" value={teamMembers.length} subtitle="Members" icon={Users} color="indigo" />
        <StatCard title="Present Today" value={presentToday} subtitle="of team members" icon={CheckCircle} color="emerald" />
        <StatCard title="Pending Approvals" value={pendingLeaveCount} subtitle="Final approval" icon={TrendingUp} color="amber" />
        <StatCard title="Appraisals Pending" value={teamAppraisals.filter(a => !a.managerRating).length} subtitle="Review required" icon={Star} color="purple" />
      </div>

      {/* Performance Chart */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8">
          <Card>
            <CardHeader title="Team Performance Overview" subtitle="Self vs Manager Rating · Annual Appraisal 2025" icon={BarChart3} />
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={performanceChartData} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0', fontSize: 12, borderRadius: 8 }} />
                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Bar dataKey="selfRating" fill="#a78bfa" radius={[4, 4, 0, 0]} name="Self Rating" />
                <Bar dataKey="managerRating" fill="#6366f1" radius={[4, 4, 0, 0]} name="Manager Rating" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Attendance Calendar */}
        <div className="col-span-12 lg:col-span-4">
          <Card>
            <CardHeader title="Leave Calendar" subtitle="July 2025" icon={CheckCircle} iconColor="text-teal-600 dark:text-teal-400" iconBg="bg-teal-50 dark:bg-teal-900/20" />
            <div className="grid grid-cols-7 gap-1 text-center">
              {['S','M','T','W','T','F','S'].map((d, i) => (
                <div key={i} className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 py-1">{d}</div>
              ))}
              {[...Array(1)].map((_, i) => <div key={'e' + i} />)}
              {calendarData.map(({ date, status, who }) => (
                <div key={date} title={who ? `${who} on leave` : ''}
                  className={`text-xs py-1.5 rounded-lg font-medium transition-colors cursor-default ${
                    status === 'leave'
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {date}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs text-slate-400 dark:text-slate-500">
              <div className="w-3 h-3 rounded bg-amber-200 dark:bg-amber-900/30" />
              <span>Team members on leave</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Leave Approvals */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Final Leave Approvals</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Manager-level approval required</p>
          </div>
        </div>
        {approvals.length === 0 ? (
          <div className="py-10 text-center text-slate-400 dark:text-slate-500 text-sm">
            <CheckCircle size={28} className="mx-auto mb-2 text-emerald-400" />
            No pending approvals.
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {approvals.map(item => (
              <div key={item.id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <Avatar initials={item.avatar} />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{item.employeeName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge status={item.actionStatus === 'pending' ? 'pending' : item.actionStatus}>{item.type}</Badge>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{item.from} → {item.to} · {item.days}d</span>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 italic">"{item.reason}"</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
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

      {/* Appraisal Review */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Appraisal Review</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Annual Appraisal 2025 · Manager Review Phase</p>
        </div>
        <div className="divide-y divide-slate-50 dark:divide-slate-800">
          {teamAppraisals.map(member => (
            <div key={member.id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <Avatar initials={member.avatar} />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{member.name}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{member.designation}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Self</p>
                  <p className="text-sm font-bold text-purple-600 dark:text-purple-400">{member.selfRating || '—'}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Manager</p>
                  <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{member.managerRating || '—'}</p>
                </div>
                <Badge status={member.status.toLowerCase()}>{member.status}</Badge>
                <Button variant="secondary" size="sm" onClick={() => setAppraisalModal(member)}>Review</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Appraisal modal */}
      <Modal isOpen={!!appraisalModal} onClose={() => setAppraisalModal(null)} title="Appraisal Review" size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAppraisalModal(null)}>Cancel</Button>
            <Button variant="primary" onClick={saveRating}>Save Rating</Button>
          </>
        }
      >
        {appraisalModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
              <Avatar initials={appraisalModal.avatar} size="lg" />
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100">{appraisalModal.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{appraisalModal.designation}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Self Rating: <strong className="text-purple-600 dark:text-purple-400">{appraisalModal.selfRating || 'Not submitted'}</strong></p>
              </div>
            </div>
            {appraisalModal.kpis && (
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">KPI Scores (Self Rated)</p>
                <div className="space-y-2">
                  {Object.entries(appraisalModal.kpis).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 dark:text-slate-400 capitalize w-24">{k}</span>
                      <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                        <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${(v / 5) * 100}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 w-6">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Your Rating (out of 5) *</label>
              <input ref={ratingRef} type="number" min="1" max="5" step="0.1" defaultValue={appraisalModal.managerRating || ''} placeholder="e.g. 4.2" className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600 bg-white dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Manager Feedback</label>
              <textarea ref={feedbackRef} rows={3} defaultValue="" placeholder="Provide constructive feedback..." className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600 resize-none bg-white dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500" />
            </div>
          </div>
        )}
      </Modal>

      {/* Action modal */}
      <Modal isOpen={!!actionModal} onClose={() => setActionModal(null)} title={actionModal?.type === 'approve' ? 'Approve Leave' : 'Reject Leave'} size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setActionModal(null)}>Cancel</Button>
            <Button variant={actionModal?.type === 'approve' ? 'success' : 'danger'} onClick={confirmAction}>
              Confirm {actionModal?.type === 'approve' ? 'Approval' : 'Rejection'}
            </Button>
          </>
        }
      >
        {actionModal && (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {actionModal.type === 'approve' ? 'Approve' : 'Reject'} <strong>{actionModal.item.type}</strong> for{' '}
            <strong>{actionModal.item.employeeName}</strong> ({actionModal.item.from} → {actionModal.item.to})?
          </p>
        )}
      </Modal>
    </div>
  );
}
