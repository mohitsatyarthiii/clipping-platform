const Button = ({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  disabled = false,
  ...props
}) => {
  const baseStyles =
    'font-medium rounded-lg transition-all duration-200 inline-flex items-center justify-center gap-2';

  const variants = {
    default:
      'bg-linear-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed',
    outline:
      'border-2 border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed',
    ghost:
      'text-slate-300 hover:text-white hover:bg-slate-800/40 disabled:opacity-50 disabled:cursor-not-allowed',
    secondary:
      'bg-slate-800/60 hover:bg-slate-700/60 text-slate-200 border border-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed',
    destructive:
      'bg-red-500/80 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base',
    xl: 'px-8 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
