export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg
              className="w-9 h-9 text-emerald-400 drop-shadow-lg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7l-9-5z" />
              <path d="M9 12l2 2 4-4" className="text-emerald-300" />
            </svg>
            <div className="absolute -inset-1 bg-emerald-400/20 rounded-full blur-md -z-10"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-white">Guard</span>
              <span className="text-emerald-400">Rail</span>
            </h1>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
              SAST Engine
            </p>
          </div>
        </div>

        {/* Tagline */}
        <p className="hidden md:block text-sm text-slate-400 italic font-light">
          Translating Code Risk Into Business Language
        </p>

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs text-slate-500 font-medium">Engine Online</span>
        </div>
      </div>
    </header>
  );
}
