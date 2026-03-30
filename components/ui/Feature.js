function Feature({ icon, text }) {
  return (
    <div className="flex items-center gap-3 text-gray-300">
      <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg">
        {icon}
      </div>
      <span>{text}</span>
    </div>
  );
}

function Stat({ number, label }) {
  return (
    <div>
      <div className="text-xl font-bold text-white">{number}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}