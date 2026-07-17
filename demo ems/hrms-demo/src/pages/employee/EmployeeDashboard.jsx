import { useState } from 'react';
import { Calendar, Clock, TrendingUp, FileText, Award, PlusCircle, MapPin, Mail, Phone, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card, { CardHeader } from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Avatar from '../../components/ui/Avatar';
import Table from '../../components/ui/Table';
import { useToast, ToastContainer } from '../../components/ui/Toast';
import { monthlyAttendanceSummary, attendanceChartData } from '../../data/attendance';
import { leaveBalance as initialBalance, myLeaveRequests, leaveTypes } from '../../data/leaves';
import { payslips } from '../../data/payroll';
import { appraisalCycle, myAppraisalHistory } from '../../data/appraisals';

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

function LeaveBalanceCard({ type, label, total, used, remaining }) {
  const pct = total > 0 ? Math.round((remaining / total) * 100) : 0;
  const colorMap = {
    casual: { bar: 'bg-indigo-500', text: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20', track: 'bg-white/70 dark:bg-slate-700' },
    sick:   { bar: 'bg-rose-500',   text: 'text-rose-600 dark:text-rose-400',     bg: 'bg-rose-50   dark:bg-rose-900/20',   track: 'bg-white/70 dark:bg-slate-700' },
    earned: { bar: 'bg-emerald-500',text: 'text-emerald-600 dark:text-emerald-400',bg:'bg-emerald-50 dark:bg-emerald-900/20',track: 'bg-white/70 dark:bg-slate-700' },
  };
  const c = colorMap[type] || colorMap.casual;
  return (
    <div className={`${c.bg} rounded-xl p-4 border border-transparent`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
          <p className={`text-2xl font-bold ${c.text} mt-0.5`}>{remaining}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">of {total} days</p>
        </div>
        <div className={`text-xs font-semibold ${c.text}`}>{used} used</div>
      </div>
      <div className={`w-full ${c.track} rounded-full h-2 mt-3`}>
        <div className={`${c.bar} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function EmployeeDashboard({ user }) {
  const { toasts, removeToast, toast } = useToast();
  const [leaveModal, setLeaveModal] = useState(false);
  const [payslipModal, setPayslipModal] = useState(null);
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
      toast('Invalid date range selected', 'error');
      return;
    }
    const newRequest = {
      id: leaveRequests.length + 1,
      type: leaveForm.type,
      from: leaveForm.from,
      to: leaveForm.to,
      days: computedDays,
      reason: leaveForm.reason,
      status: 'pending',
      appliedOn: new Date().toISOString().split('T')[0],
      approvedBy: null,
    };
    setLeaveRequests([newRequest, ...leaveRequests]);
    setLeaveModal(false);
    setLeaveForm({ type: '', from: '', to: '', reason: '' });
    toast(`Leave request submitted for ${computedDays} day${computedDays > 1 ? 's' : ''}`, 'success');
  };

  const leaveColumns = [
    { key: 'type', label: 'Leave Type' },
    { key: 'from', label: 'From' },
    { key: 'to', label: 'To' },
    { key: 'days', label: 'Days', render: v => `${v}d` },
    { key: 'status', label: 'Status', render: v => <Badge status={v} /> },
    { key: 'appliedOn', label: 'Applied On' },
    { key: 'approvedBy', label: 'Approved By', render: v => v || <span className="text-slate-400">Pending</span> },
  ];

  const inputCls = 'w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800';
  const labelCls = 'block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5';

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Good morning, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">Here's your overview for today</p>
        </div>
        <Button variant="primary" icon={PlusCircle} onClick={() => setLeaveModal(true)}>Apply Leave</Button>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-4">
          <Card className="h-full">
            <div className="flex flex-col items-center text-center pt-2 pb-4">
              <Avatar initials={user?.avatar || 'AS'} size="xl" />
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mt-3">{user?.name}</h2>
              <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">{user?.designation}</p>
              <Badge status="active" className="mt-2">Active</Badge>
              <div className="w-full border-t border-slate-200 dark:border-slate-700 mt-4 pt-4 space-y-2.5 text-left">
                {[
                  { icon: MapPin, label: user?.department },
                  { icon: Mail, label: user?.email },
                  { icon: Phone, label: user?.phone },
                  { icon: Calendar, label: `Joined ${user?.joinDate}` },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                    <Icon size={13} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
                    <span className="truncate">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-8 space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <StatCard title="Present" value={monthlyAttendanceSummary.present} subtitle="Days this month" icon={Calendar} color="emerald" />
            <StatCard title="Absent" value={monthlyAttendanceSummary.absent} subtitle="Days this month" icon={Clock} color="red" />
            <StatCard title="Late" value={monthlyAttendanceSummary.late} subtitle="Days this month" icon={TrendingUp} color="amber" />
          </div>
          <Card>
            <CardHeader title="Attendance This Month" subtitle="Weekly breakdown" icon={Calendar} />
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={attendanceChartData} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #334155', background: '#1e293b', color: '#e2e8f0' }} />
                <Bar dataKey="present" fill="#6366f1" radius={[4,4,0,0]} name="Present" />
                <Bar dataKey="absent"  fill="#f87171" radius={[4,4,0,0]} name="Absent" />
                <Bar dataKey="late"    fill="#fbbf24" radius={[4,4,0,0]} name="Late" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      {/* Leave Balance */}
      <Card>
        <CardHeader title="Leave Balance" subtitle="Current leave entitlements" icon={Calendar} action={<Button variant="ghost" size="sm" onClick={() => setLeaveModal(true)}>+ Apply Leave</Button>} />
        <div className="grid grid-cols-3 gap-4">
          <LeaveBalanceCard type="casual" label="Casual Leave" total={balance.casual.total} used={balance.casual.used} remaining={balance.casual.remaining} />
          <LeaveBalanceCard type="sick"   label="Sick Leave"   total={balance.sick.total}   used={balance.sick.used}   remaining={balance.sick.remaining} />
          <LeaveBalanceCard type="earned" label="Earned Leave" total={balance.earned.total} used={balance.earned.used} remaining={balance.earned.remaining} />
        </div>
      </Card>

      {/* Leave requests table */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">My Leave Requests</h3>
          <span className="text-xs text-slate-400">{leaveRequests.length} total</span>
        </div>
        <Table columns={leaveColumns} data={leaveRequests} emptyMessage="No leave requests yet" />
      </Card>

      {/* Payslips + Appraisal */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-6">
          <Card>
            <CardHeader title="Payslips" subtitle="Monthly salary statements" icon={FileText} iconColor="text-emerald-600 dark:text-emerald-400" iconBg="bg-emerald-50 dark:bg-emerald-900/30" />
            <div className="space-y-2">
              {payslips.slice(0, 4).map(p => (
                <div key={p.id} onClick={() => setPayslipModal(p)} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                      <FileText size={14} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{p.month}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">Paid on {p.paidOn}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">₹{p.net_pay.toLocaleString('en-IN')}</p>
                    <Badge status="paid" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-6">
          <Card>
            <CardHeader title="Appraisal" subtitle={appraisalCycle.name} icon={Award} iconColor="text-purple-600 dark:text-purple-400" iconBg="bg-purple-50 dark:bg-purple-900/30" />
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 mb-4 border border-purple-100 dark:border-purple-800/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{appraisalCycle.period}</span>
                <Badge status="in progress">{appraisalCycle.status}</Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Current phase: <span className="font-semibold text-purple-700 dark:text-purple-400">{appraisalCycle.phase}</span></p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Manager review due: {appraisalCycle.managerReviewDue}</p>
            </div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-3">Past Ratings</p>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
              <div className="space-y-4">
                {myAppraisalHistory.map(h => (
                  <div key={h.year} className="flex gap-4 pl-8 relative">
                    <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full border-2 border-indigo-400 bg-white dark:bg-slate-800" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{h.year}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{h.rating} / 5</span>
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">+{h.hike}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{h.grade}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">{h.feedback}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Apply Leave Modal */}
      <Modal isOpen={leaveModal} onClose={() => setLeaveModal(false)} title="Apply for Leave"
        footer={<><Button variant="secondary" onClick={() => setLeaveModal(false)}>Cancel</Button><Button variant="primary" onClick={submitLeave}>Submit Request</Button></>}
      >
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Leave Type *</label>
            <select value={leaveForm.type} onChange={e => setLeaveForm({...leaveForm, type: e.target.value})} className={inputCls}>
              <option value="">Select leave type</option>
              {leaveTypes.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>From Date *</label><input type="date" value={leaveForm.from} onChange={e => setLeaveForm({...leaveForm, from: e.target.value})} className={inputCls} /></div>
            <div><label className={labelCls}>To Date *</label><input type="date" value={leaveForm.to} onChange={e => setLeaveForm({...leaveForm, to: e.target.value})} className={inputCls} /></div>
          </div>
          {computedDays > 0 && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/40 rounded-lg px-4 py-2 text-xs text-indigo-700 dark:text-indigo-400 font-medium">
              📅 {computedDays} working day{computedDays > 1 ? 's' : ''} selected
            </div>
          )}
          <div>
            <label className={labelCls}>Reason</label>
            <textarea value={leaveForm.reason} onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})} rows={3} placeholder="Brief reason for leave..." className={`${inputCls} resize-none`} />
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 rounded-lg px-4 py-3 text-xs text-amber-700 dark:text-amber-400">
            ⚠️ Leave requires approval from your Team Lead and Manager.
          </div>
        </div>
      </Modal>

      {/* Payslip Modal */}
      {payslipModal && (
        <Modal isOpen={!!payslipModal} onClose={() => setPayslipModal(null)} title={`Payslip — ${payslipModal.month}`} size="lg"
          footer={
            <>
              <Button variant="secondary" onClick={() => setPayslipModal(null)}>Close</Button>
              <Button variant="primary" icon={Download} onClick={() => { toast('Payslip download started', 'info'); }}>Download PDF</Button>
            </>
          }
        >
          <div className="space-y-5">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl p-5 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-indigo-200 text-xs">EMS — Employee Management System</p>
                  <p className="font-bold text-lg">{user?.name}</p>
                  <p className="text-indigo-200 text-sm">{user?.designation} · {user?.department}</p>
                </div>
                <div className="text-right">
                  <p className="text-indigo-200 text-xs">Net Pay</p>
                  <p className="font-bold text-2xl">₹{payslipModal.net_pay.toLocaleString('en-IN')}</p>
                  <p className="text-indigo-200 text-xs mt-1">Paid on {payslipModal.paidOn}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Earnings</p>
                <div className="space-y-2">
                  {[['Basic Salary', payslipModal.basic],['HRA', payslipModal.hra],['Dearness Allowance', payslipModal.da],['Medical', payslipModal.medical],['Conveyance', payslipModal.conveyance]].map(([l,v]) => (
                    <div key={l} className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">{l}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">₹{v.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between text-sm font-bold">
                    <span className="text-slate-800 dark:text-slate-200">Gross Pay</span>
                    <span className="text-emerald-600 dark:text-emerald-400">₹{payslipModal.gross.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Deductions</p>
                <div className="space-y-2">
                  {[['Provident Fund (PF)', payslipModal.pf],['TDS', payslipModal.tds],['Professional Tax', payslipModal.professional_tax]].map(([l,v]) => (
                    <div key={l} className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">{l}</span>
                      <span className="font-semibold text-red-500 dark:text-red-400">-₹{v.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between text-sm font-bold">
                    <span className="text-slate-800 dark:text-slate-200">Total Deductions</span>
                    <span className="text-red-500 dark:text-red-400">₹{payslipModal.total_deductions.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-4 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Net Pay (Take Home)</span>
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">₹{payslipModal.net_pay.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
