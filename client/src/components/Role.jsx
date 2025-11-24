import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Role = () => {
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/auth/status", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user.role === "job seeker") {
          navigate("/job-seeker-form");
        } else if (data.authenticated && data.user.role === "employer") {
          navigate("/employer-form");
        } else if (data.authenticated && data.user.role === "none") {
          // stay on current page
        } else {
          navigate("/");
        }
      });
  }, [navigate]);

  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedRole) {
      alert("Please select a role before submitting.");
      return;
    }

    const confirmChoice = window.confirm(
      `Are you sure you want to choose '${selectedRole}'? This action cannot be undone.`
    );

    if (!confirmChoice) return;

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/choose-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ role: selectedRole }),
      });

      const data = await response.json();

      if (data.Success === "true") {
        if (selectedRole === "job seeker") {
          navigate("/job-seeker-form");
        } else if (selectedRole === "employer") {
          navigate("/employer-form");
        }
      } else {
        alert("Failed to set role. Please try again.");
      }
    } catch (err) {
      console.error("Error choosing role:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isJobSeeker = selectedRole === "job seeker";
  const isEmployer = selectedRole === "employer";

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
            Role selection required
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 py-10">
        <div className="max-w-3xl w-full">
          <div className="bg-slate-900/70 border border-white/10 rounded-2xl shadow-2xl shadow-blue-500/20 p-6 sm:p-8 backdrop-blur">
            <div className="flex flex-col gap-3 mb-6">
              <h2 className="text-2xl sm:text-3xl font-semibold text-center">
                Choose your role
              </h2>
              <p className="text-center text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
                Tell us how you’ll use the platform so we can set up the right
                experience for you.
              </p>
              <div className="flex items-center justify-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs text-red-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                  This choice is permanent and cannot be changed later.
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 mb-6">
              {/* Job Seeker Card */}
              <button
                type="button"
                disabled={loading}
                onClick={() => setSelectedRole("job seeker")}
                className={`relative flex flex-col items-start text-left rounded-xl border px-4 py-4 sm:px-5 sm:py-5 transition-transform duration-150 ${
                  isJobSeeker
                    ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/30 scale-[1.02]"
                    : "border-white/10 bg-slate-900/60 hover:border-blue-400/70 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <h3 className="font-semibold text-base sm:text-lg">
                    Job Seeker
                  </h3>
                  {isJobSeeker && (
                    <span className="text-xs rounded-full bg-blue-500/20 px-2 py-0.5 border border-blue-400/60">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-300">
                  Create a profile, upload your resume, and apply to jobs. Let
                  the AI engine rank you against job descriptions.
                </p>
              </button>

              {/* Employer Card */}
              <button
                type="button"
                disabled={loading}
                onClick={() => setSelectedRole("employer")}
                className={`relative flex flex-col items-start text-left rounded-xl border px-4 py-4 sm:px-5 sm:py-5 transition-transform duration-150 ${
                  isEmployer
                    ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/30 scale-[1.02]"
                    : "border-white/10 bg-slate-900/60 hover:border-emerald-400/70 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <h3 className="font-semibold text-base sm:text-lg">
                    Employer
                  </h3>
                  {isEmployer && (
                    <span className="text-xs rounded-full bg-emerald-500/20 px-2 py-0.5 border border-emerald-400/60">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-300">
                  Post jobs, receive applications, and view AI-ranked candidate
                  lists with exportable reports.
                </p>
              </button>
            </div>

            {/* Hidden-ish select just to keep an accessible control if you want */}
            <div className="mb-4">
              <label className="block text-xs text-slate-400 mb-1">
                Selected role
              </label>
              <select
                disabled={loading}
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full text-sm bg-slate-950/80 border border-white/15 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500/70"
              >
                <option value="">-- Select Role --</option>
                <option value="job seeker">Job Seeker</option>
                <option value="employer">Employer</option>
              </select>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`group relative flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm sm:text-base font-medium text-white transition-transform duration-150 ${
                loading
                  ? "bg-slate-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-500/40"
              }`}
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Confirm role
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                    →
                  </span>
                </>
              )}
            </button>
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

export default Role;
