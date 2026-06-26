import { useState } from 'react';

const severityConfig = {
  high: {
    bg: 'bg-red-500/15',
    text: 'text-red-400',
    border: 'border-red-500/30',
    dot: 'bg-red-400',
  },
  medium: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    dot: 'bg-amber-400',
  },
  low: {
    bg: 'bg-blue-500/15',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    dot: 'bg-blue-400',
  },
};

export default function FindingsTable({ findings, onFindingClick }) {
  const [expandedRow, setExpandedRow] = useState(null);

  if (!findings || findings.length === 0) {
    return (
      <div className="animate-fade-in bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[200px]" style={{ animationDelay: '0.2s' }}>
        <svg className="w-12 h-12 text-slate-700 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12l2 2 4-4" />
          <circle cx="12" cy="12" r="10" />
        </svg>
        <h3 className="text-sm font-semibold text-slate-500 mb-1">No Findings</h3>
        <p className="text-xs text-slate-600">Run an analysis to see security findings</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5 hover:border-slate-700" style={{ animationDelay: '0.2s' }}>
      {/* Table Header */}
      <div className="px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14,2 14,8 20,8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          Security Findings
        </h3>
        <span className="text-xs text-slate-500 font-medium">{findings.length} issue{findings.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Scrollable Content */}
      <div className="max-h-[500px] overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800/50">
              <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-2.5">Severity</th>
              <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-2.5">Rule</th>
              <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-2.5">Title</th>
              <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-2.5">Line</th>
              <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-2.5">Business Impact</th>
            </tr>
          </thead>
          <tbody>
            {findings.map((finding, idx) => {
              const sev = severityConfig[finding.severity] || severityConfig.low;
              const isExpanded = expandedRow === idx;

              return (
                <tr
                  key={`${finding.ruleId}-${finding.line}-${idx}`}
                  onClick={() => {
                    onFindingClick?.(finding.line);
                    setExpandedRow(isExpanded ? null : idx);
                  }}
                  className={`border-b border-slate-800/30 hover:bg-slate-800/50 cursor-pointer transition-all duration-200 group ${isExpanded ? 'bg-slate-800/30' : ''}`}
                >
                  <td className="px-5 py-3 align-top">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${sev.bg} ${sev.text} border ${sev.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`}></span>
                      {finding.severity.charAt(0).toUpperCase() + finding.severity.slice(1)}
                    </span>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <code className="text-xs font-mono text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded">
                      {finding.ruleId}
                    </code>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <span className="text-sm text-white font-medium group-hover:text-emerald-300 transition-colors duration-200">
                      {finding.title}
                    </span>
                    {finding.cwe && (
                      <span className="ml-2 text-[10px] text-slate-600 font-mono">{finding.cwe}</span>
                    )}
                  </td>
                  <td className="px-3 py-3 align-top">
                    <span className="text-sm text-slate-400 font-mono">:{finding.line}</span>
                  </td>
                  <td className="px-5 py-3 max-w-sm align-top">
                    {/* Business Impact */}
                    <p className={`text-xs text-slate-400 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                      {finding.businessImpact}
                    </p>

                    {/* Expanded: Recommendation + Regulatory Flags */}
                    {isExpanded && (
                      <div className="mt-3 space-y-3 animate-fade-in">
                        {/* Recommendation */}
                        {finding.recommendation && (
                          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7l-9-5z" />
                                <path d="M9 12l2 2 4-4" />
                              </svg>
                              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Recommendation</span>
                            </div>
                            <p className="text-xs text-emerald-300/80 leading-relaxed">{finding.recommendation}</p>
                          </div>
                        )}

                        {/* Regulatory Flags */}
                        {finding.regulatoryFlags && finding.regulatoryFlags.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-slate-500 font-medium mr-1">Compliance:</span>
                            {finding.regulatoryFlags.map((flag) => (
                              <span
                                key={flag}
                                className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20"
                              >
                                {flag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
