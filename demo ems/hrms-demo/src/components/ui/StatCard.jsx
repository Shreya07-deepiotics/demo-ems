export default function StatCard({ title, value, subtitle, icon: Icon, color = 'indigo', trend, trendValue }) {
  const colorMap = {
    indigo:  { bg: 'bg-indigo-50  dark:bg-indigo-900/30',  icon: 'text-indigo-600  dark:text-indigo-400'  },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', icon: 'text-emerald-600 dark:text-emerald-400' },
    amber:   { bg: 'bg-amber-50   dark:bg-amber-900/30',   icon: 'text-amber-600   dark:text-amber-400'   },
    red:     { bg: 'bg-red-50     dark:bg-red-900/30',     icon: 'text-red-600     dark:text-red-400'     },
    blue:    { bg: 'bg-blue-50    dark:bg-blue-900/30',    icon: 'text-blue-600    dark:text-blue-400'    },
    purple:  { bg: 'bg-purple-50  dark:bg-purple-900/30',  icon: 'text-purple-600  dark:text-purple-400'  },
    teal:    { bg: 'bg-teal-50    dark:bg-teal-900/30',    icon: 'text-teal-600    dark:text-teal-400'    },
    rose:    { bg: 'bg-rose-50    dark:bg-rose-900/30',    icon: 'text-rose-600    dark:text-rose-400'    },
  };
  const c = colorMap[color] || colorMap.indigo;

  return (
    <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{title}</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 leading-none">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">{subtitle}</p>}
          {trendValue && (
            <p className={`text-xs mt-1.5 font-semibold ${trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
              {trend === 'up' ? '↑' : '↓'} {trendValue}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
            <Icon size={22} className={c.icon} />
          </div>
        )}
      </div>
    </div>
  );
}
