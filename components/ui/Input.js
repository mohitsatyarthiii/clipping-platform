const Input = ({
  className = '',
  type = 'text',
  placeholder = '',
  disabled = false,
  error = null,
  label = null,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-slate-300 mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3.5 py-2 rounded-lg bg-slate-900/60 border border-slate-700/50 text-white placeholder-slate-500 text-sm transition-all duration-200 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed ${
          error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-red-400/80 text-xs mt-1.5">{error}</p>}
    </div>
  );
};

export default Input;
