const Card = ({ children, className = '' }) => {
  return (
    <div
      className={`bg-slate-900/60 border border-slate-700/50 rounded-xl p-5 backdrop-blur-sm hover:border-slate-600/50 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/5 ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
