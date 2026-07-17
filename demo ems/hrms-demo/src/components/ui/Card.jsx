export default function Card({ children, className = '', padding = true, hover = false }) {
  return (
    <div className={`
      bg-white dark:bg-slate-800/80
      rounded-2xl
      border border-slate-200 dark:border-slate-700
      shadow-sm
      ${hover ? 'hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer' : ''}
      ${padding ? 'p-5' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, icon: Icon, iconColor = 'text-indigo-600 dark:text-indigo-400', iconBg = 'bg-indigo-50 dark:bg-indigo-900/40' }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
            <Icon size={18} className={iconColor} />
          </div>
        )}
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
