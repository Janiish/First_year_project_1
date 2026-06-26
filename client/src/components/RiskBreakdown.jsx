export default function RiskBreakdown({ riskCounts }) {
  if (!riskCounts) return null;

  const { high = 0, medium = 0, low = 0 } = riskCounts;
  const total = high + medium + low;

  const cards = [
    {
      label: 'High Risk',
      count: high,
      border: 'border-red-500/30',
      bg: 'bg-red-500/5',
      text: 'text-red-400',
      barColor: 'bg-red-500',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
    {
      label: 'Medium Risk',
      count: medium,
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/5',
      text: 'text-amber-400',
      barColor: 'bg-amber-500',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
    },
    {
      label: 'Low Risk',
      count: low,
      border: 'border-blue-500/30',
      bg: 'bg-blue-500/5',
      text: 'text-blue-400',
      barColor: 'bg-blue-500',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      ),
    },
  ];

  return (
    <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
      {/* Cards Grid */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`${card.bg} ${card.border} border rounded-2xl p-4 flex flex-col items-center gap-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]`}
          >
            <div className={`${card.text} opacity-60`}>{card.icon}</div>
            <span className={`text-3xl font-extrabold ${card.text}`}>{card.count}</span>
            <span className="text-xs font-medium text-slate-500">{card.label}</span>
          </div>
        ))}
      </div>

      {/* Proportional Bar */}
      {total > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5 hover:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Risk Distribution</span>
            <span className="text-xs text-slate-500">{total} total findings</span>
          </div>
          <div className="h-3 rounded-full bg-slate-800 overflow-hidden flex">
            {high > 0 && (
              <div
                className="bg-gradient-to-r from-red-500 to-red-400 transition-all duration-700 ease-out rounded-l-full"
                style={{ width: `${(high / total) * 100}%` }}
              />
            )}
            {medium > 0 && (
              <div
                className="bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-700 ease-out"
                style={{ width: `${(medium / total) * 100}%` }}
              />
            )}
            {low > 0 && (
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-700 ease-out rounded-r-full"
                style={{ width: `${(low / total) * 100}%` }}
              />
            )}
          </div>
          <div className="flex items-center gap-4 mt-2.5">
            {high > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span className="text-[10px] text-slate-500">High {Math.round((high / total) * 100)}%</span>
              </div>
            )}
            {medium > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="text-[10px] text-slate-500">Medium {Math.round((medium / total) * 100)}%</span>
              </div>
            )}
            {low > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="text-[10px] text-slate-500">Low {Math.round((low / total) * 100)}%</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
