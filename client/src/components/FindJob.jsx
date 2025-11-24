import React, { useEffect, useState } from "react";
import JobCard from "./JobCard";
import { useNavigate } from "react-router-dom";

const FindJob = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchJobs = async () => {
    try {
      const res = await fetch("http://localhost:5000/find-job", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch jobs");
      const allJobs = await res.json();

      // fetch profile to know applied jobs + statuses
      const resApplied = await fetch("http://localhost:5000/job-seeker-profile", {
        credentials: "include",
      });

      let appliedJobs = [];
      if (resApplied.ok) {
        const profile = await resApplied.json();
        if (profile.exists && Array.isArray(profile.data.jobs)) {
          appliedJobs = profile.data.jobs; // each job has job_id and status
        }
      }

      // create a map job_id -> status
      const statusMap = {};
      appliedJobs.forEach((j) => {
        statusMap[j.job_id] = j.status ? j.status.toLowerCase() : "applied";
      });

      const jobsWithStatus = allJobs.map((job) => ({
        ...job,
        applied: !!statusMap[job.job_id],
        status: statusMap[job.job_id] || null,
      }));

      setJobs(jobsWithStatus);
    } catch (err) {
      console.error("Failed to load jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (job_id) => {
    try {
      const res = await fetch("http://localhost:5000/job-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ job_id }),
      });

      const data = await res.json();
      if (data.success) {
        // re-fetch jobs to update applied/status
        fetchJobs();
      } else {
        alert(data.message || "Could not apply");
      }
    } catch (err) {
      console.error("Apply failed:", err.message);
      alert("Apply failed. Check console for details.");
    }
  };

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
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                  Job Portal
                </span>
                <span className="text-xs text-slate-400">
                  Fetching latest openings...
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-100">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-500/30">
              AI
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm sm:text-base">
                Job Portal
              </span>
              <span className="text-xs text-slate-400">
                Browse AI-ready openings
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/job-seeker-profile")}
              className="rounded-xl border border-blue-500/60 bg-blue-600/90 px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-md shadow-blue-500/40 hover:bg-blue-500 transition-transform hover:scale-[1.02] active:scale-95"
            >
              My Profile
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

      {/* Content */}
      <main className="flex-grow pt-24 pb-10 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-slate-50">
                Available Jobs
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Apply with one click. Your profile and resume will be ranked automatically.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/70 border border-white/10 rounded-2xl shadow-2xl shadow-blue-500/20 p-4 sm:p-6 backdrop-blur">
            {jobs.length > 0 ? (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <JobCard key={job.job_id} job={job} onApply={handleApply} />
                ))}
              </div>
            ) : (
              <div className="text-sm sm:text-base text-slate-300 italic">
                No jobs available at the moment. Check back soon.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default FindJob;
