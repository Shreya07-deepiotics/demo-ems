const colors = [
  'bg-indigo-500', 'bg-purple-500', 'bg-blue-500', 'bg-teal-500',
  'bg-emerald-500', 'bg-rose-500', 'bg-amber-500', 'bg-orange-500',
];

function getColor(initials) {
  let hash = 0;
  for (let i = 0; i < initials.length; i++) hash += initials.charCodeAt(i);
  return colors[hash % colors.length];
}

export default function Avatar({ initials = '?', size = 'md', className = '' }) {
  const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base', xl: 'w-14 h-14 text-lg' };
  return (
    <div className={`${sizes[size]} rounded-full ${getColor(initials)} flex items-center justify-center text-white font-semibold flex-shrink-0 ${className}`}>
      {initials}
    </div>
  );
}
