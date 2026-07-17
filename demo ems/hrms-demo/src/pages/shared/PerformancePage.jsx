import { useState } from 'react';
import Card, { CardHeader } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import { BarChart3, Star, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { teamAppraisals, performanceChartData } from '../../data/appraisals';

const kpiData = teamAppraisals
  .filter(m => m.kpis)
  .map(m => ({
    name: m.name.split(' ')[0],
    delivery:   m.kpis.delivery,
    quality:    m.kpis.quality,
    teamwork:   m.kpis.teamwork,
    initiative: m.kpis.initiative,
  }));

export default function PerformancePage() {
  const [selectedMember, setSelectedMember] = useState(null);

  const selectedData = selectedMember
    ? teamAppraisals.find(m => m.id === selectedMember)
    : null;

  const radarData = selectedData?.kpis
    ? Object.entries(selectedData.kpis).map(([key, value]) => ({
        subject: key.charAt(0).toUpperCase() + key.slice(1),
        value,
        fullMark: 5,
      }))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Performance Overview</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Annual Appraisal 2025 · Team KPI Ratings</p>
      </div>

      {/* Team overview chart */}
      <Card>
        <CardHeader title="Self vs Manager Ratings" subtitle="All team members · Annual Appraisal 2025" icon={BarChart3} />
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={performanceChartData} barSize={18}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0', fontSize: 12, borderRadius: 8 }} />
            <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Bar dataKey="selfRating"    fill="#a78bfa" radius={[4,4,0,0]} name="Self Rating" />
            <Bar dataKey="managerRating" fill="#6366f1" radius={[4,4,0,0]} name="Manager Rating" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* KPI breakdown */}
      <div className="grid grid-cols-12 gap-5">
        {/* Member list */}
        <div className="col-span-12 lg:col-span-5">
          <Card padding={false}>
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Individual KPI Breakdown</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Click a member to see their radar chart</p>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {teamAppraisals.map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMember(selectedMember === m.id ? null : m.id)}
                  className={`w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${selectedMember === m.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                >
                  <div className="flex items-center gap-3 text-left">
                    <Avatar initials={m.avatar} size="sm" />
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{m.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{m.designation}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-slate-400 dark:text-slate-500">Self</p>
                      <p className="text-sm font-bold text-purple-600 dark:text-purple-400">{m.selfRating ?? '—'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 dark:text-slate-500">Mgr</p>
                      <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{m.managerRating ?? '—'}</p>
                    </div>
                    <Badge status={m.status.toLowerCase()} className="hidden sm:inline-flex">{m.status}</Badge>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Radar / KPI detail */}
        <div className="col-span-12 lg:col-span-7">
          {selectedData ? (
            <Card>
              <div className="flex items-center gap-3 mb-5">
                <Avatar initials={selectedData.avatar} size="lg" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{selectedData.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{selectedData.designation}</p>
                  <Badge status={selectedData.status.toLowerCase()} className="mt-1">{selectedData.status}</Badge>
                </div>
              </div>

              {selectedData.kpis ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <Radar name="Score" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0', fontSize: 12, borderRadius: 8 }} />
                    </RadarChart>
                  </ResponsiveContainer>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {Object.entries(selectedData.kpis).map(([key, val]) => (
                      <div key={key} className="bg-slate-50 dark:bg-slate-700/60 rounded-xl p-3">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium capitalize mb-1">{key}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-200 dark:bg-slate-600 rounded-full h-1.5">
                            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${(val / 5) * 100}%` }} />
                          </div>
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 w-6">{val}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                  <Star size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Self-assessment not yet submitted</p>
                </div>
              )}
            </Card>
          ) : (
            <Card>
              <div className="text-center py-16 text-slate-400 dark:text-slate-500">
                <TrendingUp size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-semibold text-slate-600 dark:text-slate-400">Select a team member</p>
                <p className="text-sm mt-1">Click any name on the left to view their individual KPI radar chart</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
