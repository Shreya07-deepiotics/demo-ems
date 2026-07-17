const variantMap = {
  approved:                'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700',
  pending:                 'bg-amber-100   dark:bg-amber-900/40   text-amber-800   dark:text-amber-300   border border-amber-300   dark:border-amber-700',
  rejected:                'bg-red-100     dark:bg-red-900/40     text-red-800     dark:text-red-300     border border-red-300     dark:border-red-700',
  active:                  'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700',
  inactive:                'bg-slate-100   dark:bg-slate-700      text-slate-700   dark:text-slate-300   border border-slate-300   dark:border-slate-600',
  'on leave':              'bg-blue-100    dark:bg-blue-900/40    text-blue-800    dark:text-blue-300    border border-blue-300    dark:border-blue-700',
  present:                 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700',
  absent:                  'bg-red-100     dark:bg-red-900/40     text-red-800     dark:text-red-300     border border-red-300     dark:border-red-700',
  late:                    'bg-amber-100   dark:bg-amber-900/40   text-amber-800   dark:text-amber-300   border border-amber-300   dark:border-amber-700',
  processed:               'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700',
  paid:                    'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700',
  completed:               'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700',
  'in progress':           'bg-blue-100    dark:bg-blue-900/40    text-blue-800    dark:text-blue-300    border border-blue-300    dark:border-blue-700',
  'self review pending':   'bg-slate-100   dark:bg-slate-700      text-slate-700   dark:text-slate-300   border border-slate-300   dark:border-slate-600',
  'pending manager review':'bg-amber-100   dark:bg-amber-900/40   text-amber-800   dark:text-amber-300   border border-amber-300   dark:border-amber-700',
  'manager review':        'bg-blue-100    dark:bg-blue-900/40    text-blue-800    dark:text-blue-300    border border-blue-300    dark:border-blue-700',
  blue:                    'bg-blue-100    dark:bg-blue-900/40    text-blue-800    dark:text-blue-300    border border-blue-300    dark:border-blue-700',
  gray:                    'bg-slate-100   dark:bg-slate-700      text-slate-700   dark:text-slate-300   border border-slate-300   dark:border-slate-600',
};

export default function Badge({ status, children, className = '' }) {
  const label = children || status || '';
  const key = label.toLowerCase();
  const styles = variantMap[key] || 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles} ${className}`}>
      {label}
    </span>
  );
}
