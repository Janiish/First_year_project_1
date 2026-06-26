import { useState } from 'react';
import Header from './components/Header.jsx';
import CodeInput from './components/CodeInput.jsx';
import ScoreCard from './components/ScoreCard.jsx';
import RiskBreakdown from './components/RiskBreakdown.jsx';
import FindingsTable from './components/FindingsTable.jsx';
import CodeViewer from './components/CodeViewer.jsx';
import { analyzeCode } from './utils/api.js';

export default function App() {
  const [code, setCode] = useState('');
  const [results, setResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [highlightedLine, setHighlightedLine] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async (sourceCode) => {
    setCode(sourceCode);
    setIsAnalyzing(true);
    setError(null);
    setHighlightedLine(null);
    try {
      const data = await analyzeCode(sourceCode);
      setResults(data);
    } catch (err) {
      setError(err.message);
      setResults(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFindingClick = (line) => {
    setHighlightedLine(line);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans print:m-0 print:p-0">
      <div className="print:hidden">
        <Header />
      </div>

      <main className="max-w-screen-2xl mx-auto p-6 print:p-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-1 print:gap-0">
          {/* Left Column — Input & Code View */}
          <div className="space-y-6 print:hidden">
            <CodeInput onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
            {code && (
              <CodeViewer
                code={code}
                findings={results?.findings}
                highlightedLine={highlightedLine}
              />
            )}
          </div>

          {/* Right Column — Results */}
          <div className="space-y-6 print:block">
            {error && (
              <div className="animate-fade-in bg-red-500/10 border border-red-500/30 rounded-2xl p-5 flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-red-400 mb-1">Analysis Failed</h4>
                  <p className="text-xs text-red-300/80">{error}</p>
                </div>
              </div>
            )}

            <ScoreCard
              score={results?.score ?? null}
              grade={results?.grade ?? null}
              summary={results?.summary ?? null}
            />

            <RiskBreakdown riskCounts={results?.riskCounts ?? null} />

            {/* Regulatory Exposure Banner */}
            {results?.regulatoryExposure && results.regulatoryExposure.length > 0 && (
              <div className="animate-fade-in bg-slate-900 border border-slate-800 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5 hover:border-slate-700" style={{ animationDelay: '0.15s' }}>
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                    <path d="M9 15l2 2 4-4" />
                  </svg>
                  <h3 className="text-sm font-semibold text-slate-300">Regulatory Exposure</h3>
                  <span className="text-[10px] text-slate-500 font-medium ml-auto">{results.regulatoryExposure.length} frameworks impacted</span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Based on detected vulnerabilities, your code may be non-compliant with the following regulatory frameworks:
                </p>
                <div className="flex flex-wrap gap-2">
                  {results.regulatoryExposure.map((framework) => (
                    <span
                      key={framework}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 transition-all duration-200 hover:bg-purple-500/15 hover:border-purple-500/30"
                    >
                      <svg className="w-3 h-3 mr-1.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {framework}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <FindingsTable
              findings={results?.findings ?? []}
              onFindingClick={handleFindingClick}
            />

            {/* Welcome State */}
            {!results && !error && !isAnalyzing && (
              <div className="space-y-4">
                <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4M12 8h.01" />
                    </svg>
                    How It Works
                  </h3>
                  <div className="space-y-3">
                    {[
                      { step: '01', text: 'Paste your JavaScript code in the editor' },
                      { step: '02', text: 'Click "Analyze Code" to scan for vulnerabilities' },
                      { step: '03', text: 'Review your security score and risk breakdown' },
                      { step: '04', text: 'Click on findings to see business impact & remediation' },
                    ].map((item) => (
                      <div key={item.step} className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {item.step}
                        </span>
                        <span className="text-sm text-slate-500">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 mt-12">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <p className="text-xs text-slate-600">
            © 2026 GuardRail SAST — Translating Code Risk Into Business Language
          </p>
          <p className="text-xs text-slate-700">v1.0.0</p>
        </div>
      </footer>
    </div>
  );
}
