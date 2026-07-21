import { useState } from 'react';
import {
  Building2, Shield, Users, UserCheck, Star, User,
  Mail, Lock, ArrowLeft, Eye, EyeOff, Clock,
  CheckCircle, XCircle, Phone, Briefcase,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { departments, designations } from '../data/employees';

/* ── Role definitions (same as before) ─────────────────── */
const ROLE_CARDS = [
  {
    id: 'admin',
    label: 'Admin',
    description: 'Full system access, analytics & settings',
    icon: Shield,
    gradient: 'from-indigo-500 to-indigo-700',
    ring: 'ring-indigo-500',
    glow: 'shadow-indigo-500/30',
  },
  {
    id: 'hr',
    label: 'HR Manager',
    description: 'Employee directory, onboarding & leave management',
    icon: Users,
    gradient: 'from-purple-500 to-purple-700',
    ring: 'ring-purple-500',
    glow: 'shadow-purple-500/30',
  },
  {
    id: 'manager',
    label: 'Finance Manager',
    description: 'Payroll, budgets & expense reports',
    icon: UserCheck,
    gradient: 'from-teal-500 to-teal-700',
    ring: 'ring-teal-500',
    glow: 'shadow-teal-500/30',
  },
  {
    id: 'teamlead',
    label: 'Team Lead',
    description: 'Team overview & first-level approvals',
    icon: Star,
    gradient: 'from-amber-500 to-amber-700',
    ring: 'ring-amber-500',
    glow: 'shadow-amber-500/30',
  },
  {
    id: 'employee',
    label: 'Employee',
    description: 'Attendance, leave, payslips & appraisals',
    icon: User,
    gradient: 'from-rose-500 to-rose-700',
    ring: 'ring-rose-500',
    glow: 'shadow-rose-500/30',
  },
];

const ROLES_SELECT = [
  { id: 'employee',  label: 'Employee' },
  { id: 'teamlead',  label: 'Team Lead' },
  { id: 'manager',   label: 'Finance Manager' },
  { id: 'hr',        label: 'HR Manager' },
  { id: 'admin',     label: 'Admin' },
];

const inputCls = `w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white
  placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors`;

function Field({ label, error, children }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400 flex items-center gap-1 mt-0.5"><XCircle size={10} />{error}</p>}
    </div>
  );
}

/* ── Pending screen ─────────────────────────────────────── */
function PendingScreen({ account, onBack }) {
  const deadline = account?.approvalDeadline
    ? new Date(account.approvalDeadline).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : '24 hours from now';
  return (
    <div className="text-center space-y-5">
      <div className="w-16 h-16 bg-amber-500/20 border-2 border-amber-400/40 rounded-full flex items-center justify-center mx-auto">
        <Clock size={30} className="text-amber-400" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-white">Registration Submitted!</h2>
        <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
          Your request is pending admin approval.<br />
          Expected within <strong className="text-amber-400">24 hours</strong>.
        </p>
      </div>
      <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 text-left space-y-2 text-sm">
        {[['Name', account?.name], ['Email', account?.email], ['Role Requested', account?.role], ['Deadline', deadline]].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4">
            <span className="text-slate-500">{k}</span>
            <span className="text-slate-200 font-medium capitalize text-right">{v}</span>
          </div>
        ))}
      </div>
      <div className="flex items-start gap-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 text-left">
        <CheckCircle size={14} className="text-indigo-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-indigo-300">Once approved, you can sign in using your email and password.</p>
      </div>
      <button onClick={onBack} className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mx-auto">
        <ArrowLeft size={14} /> Back to role selection
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════ */
export default function Login({ onLogin }) {
  const { login, register } = useAuth();

  // 'roles' | 'login' | 'register' | 'pending'
  const [screen, setScreen]           = useState('roles');
  const [selectedRole, setSelectedRole] = useState(null);
  const [pendingAccount, setPending]  = useState(null);
  const [showPass, setShowPass]       = useState(false);
  const [loading, setLoading]         = useState(false);
  const [globalError, setGlobalError] = useState('');

  /* Login form */
  const [lf, setLf] = useState({ email: '', password: '' });
  const [le, setLe] = useState({});

  /* Register form */
  const [rf, setRf] = useState({ name: '', email: '', password: '', confirm: '', phone: '', department: '', designation: '' });
  const [re, setRe] = useState({});

  const roleCard = ROLE_CARDS.find(r => r.id === selectedRole);

  const credMap = {
    admin:    'vikram.nair@ems.com',
    hr:       'sneha.patel@ems.com',
    manager:  'suresh.babu@ems.com',
    teamlead: 'rohit.verma@ems.com',
    employee: 'arjun.sharma@ems.com',
  };

  /* ── Pick a role ── */
  const pickRole = (roleId) => {
    setSelectedRole(roleId);
    setScreen('login');
    setGlobalError('');
    setLf({ email: credMap[roleId] || '', password: '' });
    setLe({});
  };

  /* ── Login submit ── */
  const handleLogin = () => {
    const errs = {};
    if (!lf.email.trim())  errs.email    = 'Required';
    if (!lf.password)      errs.password = 'Required';
    if (Object.keys(errs).length) { setLe(errs); return; }

    setLoading(true);
    setTimeout(() => {
      const result = login(lf.email, lf.password);
      setLoading(false);
      if (result.success) {
        if (result.account.role !== selectedRole) {
          setGlobalError(`This account belongs to the "${result.account.role}" role, not "${selectedRole}". Please go back and select the correct role.`);
          return;
        }
        onLogin(result.account.role, result.account);
      } else if (result.message === 'pending') {
        setPending(result.account);
        setScreen('pending');
      } else {
        setGlobalError(result.message);
      }
    }, 600);
  };

  /* ── Register submit ── */
  const handleRegister = () => {
    const errs = {};
    if (!rf.name.trim())         errs.name    = 'Required';
    if (!rf.email.trim())        errs.email   = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rf.email)) errs.email = 'Invalid email';
    if (!rf.password)            errs.password = 'Required';
    else if (rf.password.length < 6) errs.password = 'Min 6 characters';
    if (rf.password !== rf.confirm) errs.confirm = 'Passwords do not match';
    if (!rf.department)          errs.department  = 'Select department';
    if (!rf.designation)         errs.designation = 'Select designation';
    if (Object.keys(errs).length) { setRe(errs); return; }

    setLoading(true);
    setTimeout(() => {
      const result = register({ ...rf, role: selectedRole });
      setLoading(false);
      if (result.success) {
        setPending(result.account);
        setScreen('pending');
      } else {
        setGlobalError(result.message);
      }
    }, 600);
  };

  const bindR = (key) => ({
    value: rf[key],
    onChange: e => { setRf(p => ({ ...p, [key]: e.target.value })); setRe(p => ({ ...p, [key]: '' })); setGlobalError(''); },
  });

  const goBack = () => {
    setScreen('roles');
    setSelectedRole(null);
    setGlobalError('');
    setLe({});
    setRe({});
  };

  /* ── BG ── */
  const bg = (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
    </div>
  );

  /* ── Header logo ── */
  const logo = (
    <div className="text-center mb-7">
      <div className="inline-flex items-center gap-3 mb-2">
        <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Building2 size={22} className="text-white" />
        </div>
        <div className="text-left">
          <h1 className="text-2xl font-bold text-white tracking-tight">EMS</h1>
          <p className="text-indigo-300 text-xs">Employee Management System</p>
        </div>
      </div>
    </div>
  );

  /* ════════ ROLE SELECTION SCREEN ════════ */
  if (screen === 'roles') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
        {bg}
        <div className="relative w-full max-w-2xl animate-fade-in">
          {logo}
          <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
            <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-5 text-center">
              Select your role to continue
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ROLE_CARDS.map(role => (
                <button key={role.id} onClick={() => pickRole(role.id)}
                  className="group text-left p-4 rounded-xl border-2 border-slate-700 bg-slate-800/50
                    hover:border-slate-500 hover:bg-slate-700/50 hover:shadow-lg transition-all duration-200
                    active:scale-[0.98]">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow`}>
                      <role.icon size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{role.label}</p>
                      <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{role.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <p className="text-center text-slate-600 text-xs mt-4">EMS · All data is mock/fictional</p>
        </div>
      </div>
    );
  }

  /* ════════ PENDING SCREEN ════════ */
  if (screen === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
        {bg}
        <div className="relative w-full max-w-md animate-fade-in">
          {logo}
          <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 p-7 shadow-2xl">
            <PendingScreen account={pendingAccount} onBack={goBack} />
          </div>
        </div>
      </div>
    );
  }

  /* ════════ LOGIN / REGISTER SCREENS ════════ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      {bg}
      <div className="relative w-full max-w-md animate-fade-in">
        {logo}
        <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 p-7 shadow-2xl">

          {/* Role indicator header */}
          <div className="flex items-center gap-3 mb-6">
            <button onClick={goBack} className="text-slate-400 hover:text-white transition-colors p-1">
              <ArrowLeft size={18} />
            </button>
            {roleCard && (
              <div className="flex items-center gap-2.5 flex-1">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${roleCard.gradient} flex items-center justify-center flex-shrink-0`}>
                  <roleCard.icon size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{roleCard.label}</p>
                  <p className="text-[11px] text-slate-400">
                    {screen === 'login' ? 'Sign in to your account' : 'Create a new account'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tab switcher */}
          <div className="flex bg-slate-900/60 rounded-xl p-1 mb-5">
            {['login', 'register'].map(s => (
              <button key={s} onClick={() => { setScreen(s); setGlobalError(''); setLe({}); setRe({}); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  screen === s
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}>
                {s === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {/* Global error */}
          {globalError && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
              <XCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-400">{globalError}</p>
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {screen === 'login' && (
            <div className="space-y-4">
              <Field label="Email" error={le.email}>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input type="email" value={lf.email}
                    onChange={e => { setLf(p => ({ ...p, email: e.target.value })); setLe(p => ({ ...p, email: '' })); setGlobalError(''); }}
                    placeholder="your@email.com" className={`${inputCls} pl-10`}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                </div>
              </Field>

              <Field label="Password" error={le.password}>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input type={showPass ? 'text' : 'password'} value={lf.password}
                    onChange={e => { setLf(p => ({ ...p, password: e.target.value })); setLe(p => ({ ...p, password: '' })); setGlobalError(''); }}
                    placeholder="••••••••" className={`${inputCls} pl-10 pr-10`}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                  <button onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </Field>

              {/* Credentials hint for this role */}
              {(() => {
                const credMap = {
                  admin:    { email: 'vikram.nair@ems.com',   name: 'Vikram Nair'   },
                  hr:       { email: 'sneha.patel@ems.com',   name: 'Sneha Patel'   },
                  manager:  { email: 'suresh.babu@ems.com',   name: 'Suresh Babu'   },
                  teamlead: { email: 'rohit.verma@ems.com',   name: 'Rohit Verma'   },
                  employee: { email: 'arjun.sharma@ems.com',  name: 'Arjun Sharma'  },
                };
                const cred = credMap[selectedRole];
                return cred ? (
                  <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 space-y-2">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Demo credentials</p>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Email</span>
                      <span className="text-slate-200 font-mono">{cred.email}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Password</span>
                      <span className="text-slate-200 font-mono">password123</span>
                    </div>
                  </div>
                ) : null;
              })()}

              <button onClick={handleLogin} disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all text-sm shadow-lg shadow-indigo-500/25 active:scale-[0.99]">
                {loading
                  ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Signing in…</span>
                  : 'Sign In →'}
              </button>
            </div>
          )}

          {/* ── REGISTER FORM ── */}
          {screen === 'register' && (
            <div className="space-y-3">
              <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2.5 mb-1">
                <Clock size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-400">Registration requires admin approval within 24 hours before you can sign in.</p>
              </div>

              <Field label="Full Name" error={re.name}>
                <div className="relative">
                  <User size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input type="text" {...bindR('name')} placeholder="Your full name" className={`${inputCls} pl-10`} />
                </div>
              </Field>

              <Field label="Email" error={re.email}>
                <div className="relative">
                  <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input type="email" {...bindR('email')} placeholder="your@email.com" className={`${inputCls} pl-10`} />
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Password" error={re.password}>
                  <div className="relative">
                    <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input type={showPass ? 'text' : 'password'} {...bindR('password')} placeholder="Min 6 chars" className={`${inputCls} pl-10`} />
                  </div>
                </Field>
                <Field label="Confirm" error={re.confirm}>
                  <div className="relative">
                    <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input type={showPass ? 'text' : 'password'} {...bindR('confirm')} placeholder="Repeat" className={`${inputCls} pl-10`} />
                  </div>
                </Field>
              </div>

              <Field label="Phone">
                <div className="relative">
                  <Phone size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input type="tel" {...bindR('phone')} placeholder="+91 98765 00000" className={`${inputCls} pl-10`} />
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Department" error={re.department}>
                  <select {...bindR('department')} className={`${inputCls} appearance-none`}>
                    <option value="">Select</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>
                <Field label="Designation" error={re.designation}>
                  <select {...bindR('designation')} className={`${inputCls} appearance-none`}>
                    <option value="">Select</option>
                    {designations.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>
              </div>

              <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-2.5">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Requesting access as</p>
                <p className="text-sm font-bold text-indigo-400">{roleCard?.label}</p>
              </div>

              <button onClick={handleRegister} disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all text-sm shadow-lg shadow-indigo-500/25 active:scale-[0.99]">
                {loading
                  ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Submitting…</span>
                  : 'Submit Registration →'}
              </button>
            </div>
          )}
        </div>
        <p className="text-center text-slate-600 text-xs mt-4">EMS · All data is mock/fictional</p>
      </div>
    </div>
  );
}
