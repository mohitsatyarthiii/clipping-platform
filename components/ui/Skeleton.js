const Skeleton = ({ className = '' }) => {
  return (
    <div
      className={`bg-linear-to-r from-slate-800/30 to-slate-700/30 rounded-lg animate-pulse ${className}`}
    />
  );
};

export default Skeleton;
