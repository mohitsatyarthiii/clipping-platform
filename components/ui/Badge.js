const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30',
    success: 'bg-green-500/15 text-green-300 border border-green-500/30',
    warning: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    error: 'bg-red-500/15 text-red-300 border border-red-500/30',
    info: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',
    secondary: 'bg-slate-700/40 text-slate-200 border border-slate-600/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
