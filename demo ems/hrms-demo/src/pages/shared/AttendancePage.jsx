import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/ui/StatCard';
import Table from '../../components/ui/Table';
import { Calendar, Clock, TrendingUp, CheckCircle } from 'lucide-react';
import { attendanceData, monthlyAttendanceSummary } from '../../data/attendance';

export default function AttendancePage({ user }) {
  const columns = [
    { key: 'date',   label: 'Date' },
    { key: 'status', label: 'Status', render: v => <Badge status={v} /> },
  ];

  const presentCount = attendanceData.filter(r => r.status === 'present').length;
  const lateCount    = attendanceData.filter(r => r.status === 'late').length;
  const absentCount  = attendanceData.filter(r => r.status === 'absent').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Attendance</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">July 2025 · {user?.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Present"      value={presentCount}                               subtitle="Days this month" icon={CheckCircle} color="emerald" />
        <StatCard title="Absent"       value={absentCount}                                subtitle="Days this month" icon={Clock}       color="red"     />
        <StatCard title="Late"         value={lateCount}                                  subtitle="Days this month" icon={TrendingUp}  color="amber"   />
        <StatCard title="Working Days" value={monthlyAttendanceSummary.totalWorkingDays}  subtitle="This month"      icon={Calendar}    color="indigo"  />
      </div>

      {/* Log table */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Attendance Log</h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">{attendanceData.length} records</span>
        </div>
        <Table columns={columns} data={attendanceData} />
      </Card>
    </div>
  );
}
