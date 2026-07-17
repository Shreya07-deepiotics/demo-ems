import { useState } from 'react';
import { Building2, Users, Shield, UserCheck, Star, User } from 'lucide-react';
import { employees } from '../data/employees';

const roles = [
  {
    id: 'admin',
    label: 'Admin',
    description: 'Full system access, analytics & settings',
    icon: Shield,
    color: 'from-indigo-500 to-indigo-700',
    bg: 'bg-indigo-50 border-indigo-200 hover:border-indigo-400',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    employee: employees.find(e => e.role === 'admin'),
  },
  {
    id: 'hr',
    label: 'HR Manager',
    description: 'Employee directory, payroll & onboarding',
    icon: Users,
    color: 'from-purple-500 to-purple-700',
    bg: 'bg-purple-50 border-purple-200 hover:border-purple-400',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    employee: employees.find(e => e.role === 'hr'),
  },
  {
    id: 'manager',
    label: 'Finance Manager',
    description: 'Payroll, budgets, expense reports & finance ops',
    icon: UserCheck,
    color: 'from-teal-500 to-teal-700',
    bg: 'bg-teal-50 border-teal-200 hover:border-teal-400',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    employee: employees.find(e => e.role === 'manager' && e.department === 'Finance'),
  },
  {
    id: 'teamlead',
    label: 'Team Lead',
    description: 'Team overview & first-level approvals',
    icon: Star,
    color: 'from-amber-500 to-amber-700',
    bg: 'bg-amber-50 border-amber-200 hover:border-amber-400',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    employee: employees.find(e => e.role === 'teamlead'),
  },
  {
    id: 'employee',
    label: 'Employee',
    description: 'Attendance, leave, payslips & appraisals',
    icon: User,
    color: 'from-rose-500 to-rose-700',
    bg: 'bg-rose-50 border-rose-200 hover:border-rose-400',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    employee: employees.find(e => e.role === 'employee' && e.id === 1),
  },
];

export default function Login({ onLogin }) {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!selected) return;
    setLoading(true);
    setTimeout(() => {
      const roleData = roles.find(r => r.id === selected);
      onLogin(selected, roleData.employee);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      {/* BG pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Building2 size={24} className="text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-white tracking-tight">EMS</h1>
              <p className="text-indigo-300 text-sm">Employee Management System</p>
            </div>
          </div>
          <p className="text-slate-300 text-sm max-w-md mx-auto">
            Employee Management System — EMS
          </p>
        </div>

        {/* Role cards */}
        <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
          <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-4">Choose a role to preview</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {roles.map(role => {
              const isSelected = selected === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelected(role.id)}
                  className={`relative text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-600/20 shadow-lg shadow-indigo-500/20'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-700/50'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center flex-shrink-0`}>
                      <role.icon size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{role.label}</p>
                      <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{role.description}</p>
                      {role.employee && (
                        <p className="text-indigo-400 text-xs mt-1.5 font-medium">→ {role.employee.name}</p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleLogin}
            disabled={!selected || loading}
            className="w-full mt-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 active:scale-[0.99]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Logging in...
              </span>
            ) : (
              'Enter Dashboard →'
            )}
          </button>
        </div>

        <p className="text-center text-slate-500 text-xs mt-4">
          UI Demo · EMS — Simple Employee Management System · All data is mock/fictional
        </p>
      </div>
    </div>
  );
}
