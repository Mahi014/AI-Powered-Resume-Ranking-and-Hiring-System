import React from "react";

const LandingPage = () => {
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-100">
      {/* Header */}
      <header className="w-full border-b border-white/5 bg-slate-950/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-500/30">
              AI
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm sm:text-base">
                AI Resume Hiring System
              </span>
              <span className="text-xs text-slate-400">
                Smart ranking • Faster decisions
              </span>
            </div>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 bg-white/5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live AI-powered ranking
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 py-10">
        <div className="max-w-6xl w-full grid gap-10 lg:grid-cols-[1.4fr,1fr] items-center">
          {/* Left: Hero content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 border border-emerald-400/30 px-3 py-1 text-xs font-medium text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              AI-powered resume ranking engine
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
              Hire smarter with{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                intelligent resume ranking
              </span>
              .
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-xl">
              Automatically analyze resumes using NLP, TF-IDF, cosine similarity,
              and skill-matching to surface the best candidates in seconds.
            </p>

            <ul className="space-y-2 text-sm sm:text-base text-slate-300">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center text-xs">
                  ✓
                </span>
                <span>AI-ranked applicant lists for every job posting.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center text-xs">
                  ✓
                </span>
                <span>Instant HTML previews and Excel-based reports.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center text-xs">
                  ✓
                </span>
                <span>Google login for employers and job seekers.</span>
              </li>
            </ul>
          </div>

          {/* Right: Auth card */}
          <div className="max-w-md w-full mx-auto">
            <div className="bg-slate-900/70 border border-white/10 rounded-2xl shadow-2xl shadow-blue-500/20 p-6 sm:p-8 backdrop-blur">
              <h2 className="text-xl sm:text-2xl font-semibold text-center mb-2">
                Get started in one click
              </h2>
              <p className="text-slate-300 text-center text-sm mb-6">
                Sign in with Google to post jobs, upload resumes, and see
                ranked applicants powered by AI.
              </p>

              <button
                onClick={handleGoogleLogin}
                className="group relative flex w-full items-center justify-center gap-3 rounded-xl border border-blue-500/70 bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-sm sm:text-base font-medium text-white shadow-lg shadow-blue-500/40 transition-transform duration-150 hover:scale-[1.02] active:scale-95"
              >
                <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
                  <span className="text-[#4285F4] text-lg font-bold">G</span>
                </div>
                <span>Continue with Google</span>
                <span className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                  → 
                </span>
              </button>

              <p className="mt-4 text-center text-xs text-slate-400">
                By continuing, you agree to the use of your resume data for
                ranking and report generation.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 bg-slate-950/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm text-slate-400">
          <span>
            © {new Date().getFullYear()} AI-Powered Resume Ranking and Hiring System
          </span>
          <span className="text-slate-500">
            Built with React, FastAPI, Express & PostgreSQL
          </span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
