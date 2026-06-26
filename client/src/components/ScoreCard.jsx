import { useEffect, useState } from 'react';

function getGradeColor(grade) {
  if (!grade) return { stroke: '#334155', bg: 'bg-slate-700', text: 'text-slate-400' };
  const g = grade.toUpperCase();
  if (g === 'A') return { stroke: '#34d399', bg: 'bg-emerald-500/20', text: 'text-emerald-400', ring: 'ring-emerald-500/30' };
  if (g === 'B') return { stroke: '#34d399', bg: 'bg-emerald-500/15', text: 'text-emerald-400', ring: 'ring-emerald-500/20' };
  if (g === 'C') return { stroke: '#fbbf24', bg: 'bg-amber-500/20', text: 'text-amber-400', ring: 'ring-amber-500/30' };
  if (g === 'D') return { stroke: '#fb923c', bg: 'bg-orange-500/20', text: 'text-orange-400', ring: 'ring-orange-500/30' };
  return { stroke: '#ef4444', bg: 'bg-red-500/20', text: 'text-red-400', ring: 'ring-red-500/30' };
}

export default function ScoreCard({ score, grade, summary }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const hasResults = score !== null && score !== undefined;

  useEffect(() => {
    if (!hasResults) return;
    let start = 0;
    const end = score;
    const duration = 1200;
    const stepTime = duration / end;
    const timer = setInterval(() => {
      start += 1;
      setAnimatedScore(start);
      if (start >= end) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, [score, hasResults]);

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = hasResults ? circumference - (animatedScore / 100) * circumference : circumference;
  const colors = getGradeColor(grade);

  if (!hasResults) {
    return (
      <div className="bg-slate-900 border-2 border-dashed border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[280px] transition-all duration-300">
        <svg className="w-16 h-16 text-slate-700 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7l-9-5z" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
        <h3 className="text-lg font-semibold text-slate-500 mb-2">No Analysis Yet</h3>
        <p className="text-sm text-slate-600 text-center max-w-xs">
          Paste your code and click analyze to get a security risk scorecard
        </p>
      </div>
    );
  }

  return (
    <div className="relative animate-fade-in bg-slate-900 border border-slate-800 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5 hover:border-slate-700">
      <button
        onClick={() => window.print()}
        className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 border border-slate-700 hover:text-emerald-400 hover:border-emerald-500/50 transition-colors print:hidden"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 6 2 18 2 18 9"></polyline>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
          <rect x="6" y="14" width="12" height="8"></rect>
        </svg>
        Export PDF
      </button>
      <div className="flex items-start gap-6 mt-4">
        {/* Circular Gauge */}
        <div className="relative flex-shrink-0">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke="#1e293b"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke={colors.stroke}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-100 ease-out"
              style={{ filter: `drop-shadow(0 0 6px ${colors.stroke}40)` }}
            />
          </svg>
          {/* Score Number */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-extrabold ${colors.text}`}>
              {animatedScore}
            </span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Score</span>
          </div>
        </div>

        {/* Grade + Summary */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <span className={`inline-flex items-center justify-center w-12 h-12 rounded-xl text-xl font-black ${colors.bg} ${colors.text} ring-1 ${colors.ring}`}>
              {grade}
            </span>
            <div>
              <h3 className="text-sm font-semibold text-slate-300">Security Grade</h3>
              <p className="text-xs text-slate-500">Overall assessment</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            {summary}
          </p>
        </div>
      </div>
    </div>
  );
}
