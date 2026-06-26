import { useState } from 'react';

const PLACEHOLDER_CODE = `// Paste your code here for security analysis
const password = 'admin123';
const apiKey = "sk-1234567890abcdef";

function login(user, pass) {
  const query = "SELECT * FROM users WHERE name='" + user + "'";
  eval(pass);
  return fetch('http://api.example.com/login');
}`;

const SCENARIO_1 = `const stripeKey = 'sk_test_' + '4eC39HqLyjWDarjtT1zdp7dc';
const query = "UPDATE orders SET status='paid' WHERE id=" + orderId;
eval(paymentProcessorCode);`;

const SCENARIO_2 = `const jwtSecret = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
const dbStr = 'postgres://admin:supersecret@10.0.0.5:5432/legacy';
document.innerHTML = "Welcome " + username;`;

const SCENARIO_3 = `// Clean code example
import { verifyToken } from './auth';
const userId = verifyToken(req.headers.authorization);
const user = await db.query('SELECT * FROM users WHERE id=$1', [userId]);
return res.json(user);`;

export default function CodeInput({ onAnalyze, isAnalyzing }) {
  const [code, setCode] = useState('');

  const handleSubmit = () => {
    if (code.trim()) {
      onAnalyze(code);
    }
  };

  return (
    <div className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5 hover:border-slate-700 print:hidden">
      {/* Card Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
          </div>
          <span className="text-sm font-semibold text-slate-300">Code Analysis</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-2">
            <button onClick={() => setCode(SCENARIO_1)} className="px-2 py-1 rounded text-[10px] font-bold bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">S1</button>
            <button onClick={() => setCode(SCENARIO_2)} className="px-2 py-1 rounded text-[10px] font-bold bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">S2</button>
            <button onClick={() => setCode(SCENARIO_3)} className="px-2 py-1 rounded text-[10px] font-bold bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">S3</button>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            JavaScript
          </span>
        </div>
      </div>

      {/* Code Textarea */}
      <div className="p-4 relative">
        <textarea
          id="code-input"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={PLACEHOLDER_CODE}
          spellCheck={false}
          className="w-full min-h-[300px] bg-slate-950 border border-slate-700/50 rounded-xl p-4 font-mono text-sm text-slate-300 placeholder-slate-600 resize-y focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
        />
        {isAnalyzing && (
          <div className="pointer-events-none absolute inset-4 overflow-hidden rounded-xl bg-emerald-500/5 backdrop-blur-[1px]">
            <div className="laser-scan bg-emerald-400 shadow-[0_0_20px_4px_rgba(52,211,153,0.5)] h-[2px] w-full"></div>
          </div>
        )}
      </div>

      {/* Analyze Button */}
      <div className="px-4 pb-4">
        <button
          id="analyze-button"
          onClick={handleSubmit}
          disabled={isAnalyzing || !code.trim()}
          className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2.5 transition-all duration-300 ${
            isAnalyzing
              ? 'bg-emerald-500/20 text-emerald-400 cursor-wait animate-pulse-glow'
              : code.trim()
              ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          {isAnalyzing ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing Security Risks...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7l-9-5z" />
              </svg>
              Analyze Code
            </>
          )}
        </button>
      </div>
    </div>
  );
}
