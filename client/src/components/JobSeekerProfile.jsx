import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const statusBadgeClass = (status) => {
  switch ((status || "applied").toLowerCase()) {
    case "rejected":
      return "text-red-300 bg-red-500/10 border border-red-500/40";
    case "selected":
      return "text-emerald-300 bg-emerald-500/10 border border-emerald-500/40";
    case "applied":
    default:
      return "text-blue-300 bg-blue-500/10 border border-blue-500/40";
  }
};

const humanStatus = (status) => {
  if (!status) return "Applied";
  const s = status.replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const JobSeekerProfile = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      try {
        const res = await fetch("http://localhost:5000/logout", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          navigate("/");
        }
      } catch (err) {
        console.error("Logout failed: ", err.message);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/job-seeker-profile", {
          credentials: "include",
        });
        const data = await res.json();

        if (!data.exists && isMounted) {
          navigate("/job-seeker-form");
        } else if (isMounted) {
          setProfile(data.data);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-100">
        <header className="w-full border-b border-white/5 bg-slate-950/70 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-500/30">
                AI
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm sm:text-base">
                  Job Seeker Dashboard
                </span>
                <span className="text-xs text-slate-400">
                  Loading your profile...
                </span>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-grow flex items-center justify-center px-4">
          <div className="flex flex-col items-center gap-3">
            <span className="h-8 w-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <p className="text-sm text-slate-300">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-100">
        <header className="w-full border-b border-white/5 bg-slate-950/70 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-500/30">
                AI
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm sm:text-base">
                  Job Seeker Dashboard
                </span>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-grow flex items-center justify-center px-4">
          <p className="text-red-400 text-sm sm:text-base">
            Failed to load profile.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-100">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-500/30">
              AI
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm sm:text-base">
                Job Seeker Dashboard
              </span>
              <span className="text-xs text-slate-400">
                Welcome, {profile.name}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/find-job")}
              className="rounded-xl border border-blue-500/60 bg-blue-600/90 px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-md shadow-blue-500/40 hover:bg-blue-500 transition-transform hover:scale-[1.02] active:scale-95"
            >
              Find Jobs
            </button>
            <button
              onClick={handleLogout}
              className="rounded-xl border border-red-500/60 bg-red-600/90 px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-md shadow-red-500/40 hover:bg-red-500 transition-transform hover:scale-[1.02] active:scale-95"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-24 pb-10 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Profile card */}
          <div className="bg-slate-900/70 border border-white/10 rounded-2xl shadow-2xl shadow-blue-500/20 p-6 sm:p-8 backdrop-blur">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold mb-1">
                  Job Seeker Profile
                </h1>
                <p className="text-xs sm:text-sm text-slate-300">
                  This information is used by the AI engine for ranking you
                  against job descriptions.
                </p>
              </div>
              <div className="flex flex-col items-start sm:items-end gap-1 text-xs sm:text-sm">
                <span className="text-slate-400">
                  Graduation Year:{" "}
                  <span className="text-slate-100 font-medium">
                    {profile.graduation_year}
                  </span>
                </span>
                <span className="text-slate-400">
                  Degree:{" "}
                  <span className="text-slate-100 font-medium">
                    {profile.degree}
                  </span>
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-sm text-slate-200 mb-4">
              <p>
                <span className="text-slate-400">Name: </span>
                <span className="font-medium">{profile.name}</span>
              </p>
              <p>
                <span className="text-slate-400">College: </span>
                <span className="font-medium">{profile.college}</span>
              </p>
              <p>
                <span className="text-slate-400">Resume file: </span>
                <span className="font-medium">{profile.resume_name}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="http://localhost:5000/job-seeker-resume"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-slate-950/70 px-4 py-2 text-xs sm:text-sm font-medium text-slate-100 hover:border-blue-500/70 hover:bg-slate-900 transition"
              >
                <span role="img" aria-label="resume">
                  📄
                </span>
                View Resume
              </a>
            </div>
          </div>

          {/* Jobs applied */}
          <div className="bg-slate-900/70 border border-white/10 rounded-2xl shadow-xl shadow-blue-500/10 p-6 sm:p-8 backdrop-blur">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-blue-300">
                Jobs You&apos;ve Applied To
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Track your applications and see their latest status.
              </p>
            </div>

            {Array.isArray(profile.jobs) && profile.jobs.length > 0 ? (
              <ul className="space-y-4">
                {profile.jobs.map((job) => (
                  <li
                    key={job.application_id}
                    className="rounded-xl border border-white/10 bg-slate-950/70 p-4 sm:p-5 shadow-md shadow-slate-950/60"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-slate-100">
                          {job.job_title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-300">
                          {job.job_description}
                        </p>
                        <span className="inline-flex items-center text-xs sm:text-sm text-slate-200 bg-slate-800/80 px-2.5 py-1 rounded-full">
                          Role:{" "}
                          <span className="ml-1 font-medium">
                            {job.job_role}
                          </span>
                        </span>
                      </div>

                      <div
                        className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${statusBadgeClass(
                          job.status
                        )}`}
                      >
                        {humanStatus(job.status)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-300 italic">
                You haven&apos;t applied for any jobs yet. Click{" "}
                <button
                  type="button"
                  onClick={() => navigate("/find-job")}
                  className="text-blue-300 underline underline-offset-2 hover:text-blue-200"
                >
                  Find Jobs
                </button>{" "}
                to explore openings.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobSeekerProfile;
