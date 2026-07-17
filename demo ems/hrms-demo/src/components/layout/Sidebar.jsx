import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, DollarSign, Star,
  Settings, ChevronLeft, ChevronRight, Building2, UserCheck,
  ClipboardList, BarChart3, Shield, LogOut, CheckSquare
} from 'lucide-react';
import Avatar from '../ui/Avatar';

const navByRole = {
  employee: [
    { label: 'Dashboard',  icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Attendance', icon: Calendar,         path: '/attendance' },
    { label: 'Leave',      icon: ClipboardList,    path: '/leave' },
    { label: 'Payslips',   icon: DollarSign,       path: '/payslips' },
    { label: 'Appraisal',  icon: Star,             path: '/appraisal' },
  ],
  teamlead: [
    { label: 'Dashboard',       icon: LayoutDashboard, path: '/dashboard' },
    { label: 'My Team',         icon: Users,           path: '/team' },
    { label: 'Attendance',      icon: Calendar,        path: '/attendance' },
    { label: 'Leave Approvals', icon: CheckSquare,     path: '/leave-approvals' },
    { label: 'Appraisal',       icon: Star,            path: '/appraisal' },
  ],
  manager: [
    { label: 'Dashboard',      icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Payroll',        icon: DollarSign,      path: '/finance/payroll' },
    { label: 'Attendance',     icon: Calendar,        path: '/attendance' },
    { label: 'Reports',        icon: BarChart3,       path: '/performance' },
    { label: 'Appraisals',     icon: Star,            path: '/appraisal' },
  ],
  hr: [
    { label: 'Dashboard',       icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Employees',       icon: Users,           path: '/employees' },
    { label: 'Onboarding',      icon: UserCheck,       path: '/onboarding' },
    { label: 'Leave Management',icon: ClipboardList,   path: '/leave-management' },
    { label: 'Reports',         icon: BarChart3,       path: '/reports' },
  ],
  admin: [
    { label: 'Dashboard',          icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Manage Employees',   icon: Users,           path: '/admin/employees' },
    { label: 'Leave Approvals',    icon: CheckSquare,     path: '/admin/leave-approvals' },
    { label: 'Analytics',          icon: BarChart3,       path: '/analytics' },
    { label: 'Roles & Permissions',icon: Shield,          path: '/roles' },
    { label: 'Payroll',            icon: DollarSign,      path: '/payroll' },
    { label: 'Company Settings',   icon: Settings,        path: '/settings' },
  ],
};

const roleLabels = {
  employee: 'Employee', teamlead: 'Team Lead',
  manager: 'Finance Manager', hr: 'HR', admin: 'Admin',
};

const roleBadgeColor = {
  employee: 'bg-rose-100   dark:bg-rose-900/30   text-rose-700   dark:text-rose-300',
  teamlead: 'bg-amber-100  dark:bg-amber-900/30  text-amber-700  dark:text-amber-300',
  manager:  'bg-teal-100   dark:bg-teal-900/30   text-teal-700   dark:text-teal-300',
  hr:       'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  admin:    'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
};

export default function Sidebar({ role, user, collapsed, setCollapsed, onLogout }) {
  const navItems = navByRole[role] || navByRole.employee;
  const location = useLocation();

  return (
    <aside
      style={{ height: '100%', overflowY: 'hidden' }}
      className={`
        bg-white dark:bg-slate-900
        border-r border-slate-200 dark:border-slate-700/60
        flex flex-col flex-shrink-0
        transition-all duration-300 ease-in-out
        shadow-sm dark:shadow-none
        ${collapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* ── Logo ── */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-100 dark:border-slate-700/60 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/30">
          <Building2 size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-slate-900 dark:text-white font-extrabold text-sm leading-tight tracking-tight">EMS</p>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-tight">Employee Management System</p>
          </div>
        )}
      </div>

      {/* ── Role badge ── */}
      {!collapsed && (
        <div className="px-3 pt-3 pb-1">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${roleBadgeColor[role] || roleBadgeColor.employee}`}>
            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70 animate-pulse flex-shrink-0" />
            <span className="text-xs font-semibold">{roleLabels[role]} View</span>
          </div>
        </div>
      )}

      {/* ── Nav section label ── */}
      {!collapsed && (
        <p className="px-4 pt-4 pb-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Navigation
        </p>
      )}

      {/* ── Nav items ── */}
      <nav
        className="flex-1 px-2 py-2 space-y-0.5 scrollbar-thin"
        style={{ overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : ''}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-150 group relative
                ${collapsed ? 'justify-center' : ''}
                ${isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-600 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-slate-800'
                }
              `}
            >
              {/* Active left indicator bar */}
              {isActive && !collapsed && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white/50 rounded-full" />
              )}
              <item.icon
                size={18}
                className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}
              />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* ── Bottom: user + logout + collapse ── */}
      <div className="border-t border-slate-100 dark:border-slate-700/60">
        {/* User strip */}
        {!collapsed && (
          <div className="px-3 py-3 flex items-center gap-2.5">
            <Avatar initials={user?.avatar || 'U'} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-slate-900 dark:text-white text-xs font-bold truncate">{user?.name}</p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">{user?.email}</p>
            </div>
          </div>
        )}

        <div className={`px-2 pb-3 flex gap-1 ${collapsed ? 'flex-col items-center' : 'items-center'}`}>
          {/* Logout */}
          <button
            onClick={onLogout}
            title="Logout"
            className={`
              flex items-center gap-2 px-3 py-2 rounded-xl
              text-slate-500 dark:text-slate-400
              hover:text-red-600 dark:hover:text-red-400
              hover:bg-red-50 dark:hover:bg-red-950/40
              text-sm font-medium transition-colors
              ${collapsed ? '' : 'flex-1'}
            `}
          >
            <LogOut size={16} className="flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </div>
    </aside>
  );
}
