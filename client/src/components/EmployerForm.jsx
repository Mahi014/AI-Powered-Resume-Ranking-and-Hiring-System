import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EmployerForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    post: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkEmployerProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/check/employer", {
          credentials: "include",
        });
        const data = await res.json();

        if (data.exists) {
          navigate("/employer-profile");
        }
      } catch (err) {
        console.error("Failed to check employer profile", err);
      }
    };

    checkEmployerProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, company, post } = formData;

    if (!name || !company || !post) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/job-employer-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name, company, post }),
      });

      const data = await response.json();

      if (data.Success === "true") {
        navigate("/employer-profile");
      } else {
        alert("Failed to submit employer info. Try again.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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
                Employer onboarding
              </span>
            </div>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 bg-white/5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Set up your hiring workspace
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 py-10">
        <div className="max-w-xl w-full bg-slate-900/70 border border-white/10 rounded-2xl shadow-2xl shadow-blue-500/20 p-6 sm:p-8 backdrop-blur">
          <div className="space-y-2 text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-semibold">
              Employer Details
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Tell us who you are so we can connect your account with your
              company and job postings.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1">
              <label className="block text-xs text-slate-300" htmlFor="name">
                Your Name<span className="text-red-400"> *</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="e.g., Hiring Manager"
                value={formData.name}
                onChange={handleChange}
                className="w-full text-sm bg-slate-950/80 border border-white/15 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500/70 placeholder:text-slate-500"
              />
            </div>

            {/* Company */}
            <div className="space-y-1">
              <label
                className="block text-xs text-slate-300"
                htmlFor="company"
              >
                Company Name<span className="text-red-400"> *</span>
              </label>
              <input
                type="text"
                id="company"
                name="company"
                placeholder="e.g., Acme Corp"
                value={formData.company}
                onChange={handleChange}
                className="w-full text-sm bg-slate-950/80 border border-white/15 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500/70 placeholder:text-slate-500"
              />
            </div>

            {/* Post / designation */}
            <div className="space-y-1">
              <label className="block text-xs text-slate-300" htmlFor="post">
                Your Post / Designation
                <span className="text-red-400"> *</span>
              </label>
              <input
                type="text"
                id="post"
                name="post"
                placeholder="e.g., HR Manager, CTO"
                value={formData.post}
                onChange={handleChange}
                className="w-full text-sm bg-slate-950/80 border border-white/15 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500/70 placeholder:text-slate-500"
              />
            </div>

            <p className="text-[0.7rem] text-slate-400">
              These details will be visible on your job postings and applicant
              views, helping candidates know who they&apos;re applying to.
            </p>

            {/* Submit button */}
            <button
              type="submit"
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
                  Submit employer details
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                    →
                  </span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 bg-slate-950/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm text-slate-400">
          <span>
            © {new Date().getFullYear()} AI-Powered Resume Ranking and Hiring System
          </span>
          <span className="text-slate-500">
            Built for employers & hiring teams
          </span>
        </div>
      </footer>
    </div>
  );
};

export default EmployerForm;
