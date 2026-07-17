import { useState } from 'react';
import { Search, Eye, Mail, Phone, MapPin } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import StatCard from '../../components/ui/StatCard';
import { employees } from '../../data/employees';
import { teamAttendanceToday } from '../../data/attendance';
import { Users, UserCheck, UserX } from 'lucide-react';

export default function TeamPage({ user, role }) {
  const [selectedMember, setSelectedMember] = useState(null);
  const [search, setSearch] = useState('');

  const allMembers = role === 'teamlead'
    ? employees.filter(e => e.teamLead === 'Rohit Verma')
    : employees.filter(e => e.manager === 'Priya Mehta');

  const teamMembers = allMembers.filter(m =>
    !search ||
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.designation.toLowerCase().includes(search.toLowerCase())
  );

  const presentToday = allMembers.filter(m =>
    teamAttendanceToday.find(a => a.id === m.id)?.status === 'present'
  ).length;

  const onLeaveToday = allMembers.filter(m =>
    teamAttendanceToday.find(a => a.id === m.id)?.status === 'absent'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">My Team</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {role === 'teamlead' ? "Rohit Verma's Team" : "Priya Mehta's Team"} · {allMembers.length} members
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Total Members"  value={allMembers.length} subtitle="In your team"  icon={Users}     color="indigo"  />
        <StatCard title="Present Today"  value={presentToday}      subtitle="As of now"     icon={UserCheck} color="emerald" />
        <StatCard title="On Leave Today" value={onLeaveToday}       subtitle="Absent today" icon={UserX}     color="amber"   />
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or designation…"
          className="w-full pl-8 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm
            bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200
            focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600
            placeholder-slate-400"
        />
      </div>

      {/* Team cards */}
      {teamMembers.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">
          <Users size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">No team members match your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamMembers.map(member => {
            const attendance = teamAttendanceToday.find(a => a.id === member.id);
            const attStatus  = attendance?.status || 'absent';
            return (
              <Card key={member.id} hover onClick={() => setSelectedMember(member)} padding={false}>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <Avatar initials={member.avatar} size="lg" />
                    <Badge status={attStatus} />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{member.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{member.designation}</p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-medium">{member.department}</p>
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                      <MapPin size={11} />
                      <span>{member.location}</span>
                    </div>
                    <Button variant="ghost" size="xs" icon={Eye}
                      onClick={e => { e.stopPropagation(); setSelectedMember(member); }}>
                      View
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Profile Modal — view only */}
      <Modal
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        title="Team Member Profile"
        size="sm"
        footer={
          <Button variant="secondary" onClick={() => setSelectedMember(null)}>Close</Button>
        }
      >
        {selectedMember && (
          <div className="space-y-4">
            <div className="text-center">
              <Avatar initials={selectedMember.avatar} size="xl" className="mx-auto" />
              <h3 className="font-bold text-slate-900 dark:text-white text-lg mt-3">{selectedMember.name}</h3>
              <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">{selectedMember.designation}</p>
              <Badge status={selectedMember.status.toLowerCase()} className="mt-2">{selectedMember.status}</Badge>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/60 rounded-xl p-4 space-y-2.5">
              {[
                { label: 'Email',      value: selectedMember.email },
                { label: 'Phone',      value: selectedMember.phone },
                { label: 'Location',   value: selectedMember.location },
                { label: 'Department', value: selectedMember.department },
                { label: 'Joined',     value: selectedMember.joinDate },
                { label: 'Reports To', value: selectedMember.manager || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-4">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex-shrink-0">{label}</span>
                  <span className="text-xs text-slate-900 dark:text-white font-semibold text-right break-all">{value}</span>
                </div>
              ))}
            </div>

            {(() => {
              const att = teamAttendanceToday.find(a => a.id === selectedMember.id);
              return att ? (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/40 rounded-xl p-3">
                  <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400 mb-2">Today's Attendance</p>
                  <div className="flex items-center justify-end">
                    <Badge status={att.status} />
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}
      </Modal>
    </div>
  );
}
