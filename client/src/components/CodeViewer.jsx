import { useEffect, useRef } from 'react';

const severityColors = {
  high: {
    border: 'border-l-red-500',
    bg: 'bg-red-500/5',
    gutter: 'text-red-400',
  },
  medium: {
    border: 'border-l-amber-500',
    bg: 'bg-amber-500/5',
    gutter: 'text-amber-400',
  },
  low: {
    border: 'border-l-blue-500',
    bg: 'bg-blue-500/5',
    gutter: 'text-blue-400',
  },
};

export default function CodeViewer({ code, findings, highlightedLine }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (highlightedLine && containerRef.current) {
      const lineEl = containerRef.current.querySelector(`[data-line="${highlightedLine}"]`);
      if (lineEl) {
        lineEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedLine]);

  if (!code) return null;

  const lines = code.split('\n');
  const findingsByLine = {};
  if (findings) {
    findings.forEach((f) => {
      if (!findingsByLine[f.line]) findingsByLine[f.line] = [];
      findingsByLine[f.line].push(f);
    });
  }

  return (
    <div className="animate-fade-in bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5 hover:border-slate-700" style={{ animationDelay: '0.15s' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/50">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16,18 22,12 16,6" />
            <polyline points="8,6 2,12 8,18" />
          </svg>
          <span className="text-sm font-semibold text-slate-300">Source View</span>
        </div>
        <span className="text-xs text-slate-500">{lines.length} lines</span>
      </div>

      {/* Code Block */}
      <div ref={containerRef} className="max-h-[500px] overflow-y-auto bg-slate-950">
        <pre className="text-sm font-mono leading-6">
          {lines.map((line, idx) => {
            const lineNum = idx + 1;
            const lineFindings = findingsByLine[lineNum];
            const hasFinding = !!lineFindings;
            const severity = hasFinding ? lineFindings[0].severity : null;
            const colors = severity ? severityColors[severity] : null;
            const isHighlighted = highlightedLine === lineNum;

            return (
              <div
                key={lineNum}
                data-line={lineNum}
                className={`flex transition-all duration-300 ${
                  isHighlighted
                    ? 'bg-emerald-500/10 ring-1 ring-inset ring-emerald-500/30'
                    : hasFinding
                    ? `${colors.bg} border-l-4 ${colors.border}`
                    : 'border-l-4 border-l-transparent hover:bg-slate-900/50'
                }`}
              >
                {/* Line Number */}
                <span
                  className={`select-none w-14 flex-shrink-0 text-right pr-4 py-0.5 ${
                    hasFinding
                      ? `${colors.gutter} font-semibold`
                      : 'text-slate-600'
                  } ${isHighlighted ? 'text-emerald-400 font-semibold' : ''}`}
                >
                  {lineNum}
                </span>
                {/* Code Content */}
                <code className={`flex-1 pr-5 py-0.5 ${isHighlighted ? 'text-white' : 'text-slate-300'}`}>
                  {line || ' '}
                </code>
                {/* Finding Indicator */}
                {hasFinding && (
                  <span className={`flex-shrink-0 pr-4 py-0.5 text-[10px] font-semibold ${colors.gutter} opacity-70`}>
                    {lineFindings[0].ruleId}
                  </span>
                )}
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
}
