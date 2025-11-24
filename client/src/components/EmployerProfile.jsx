import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const EmployerProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Logout handler
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

  // Fetch employer profile
  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/employer-profile", {
          credentials: "include",
        });
        const data = await res.json();

        if (!data.exists && isMounted) {
          navigate("/employer-form");
        } else if (isMounted) {
          setProfile(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch employer profile:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // Delete job handler
  const handleDeleteJob = async (job_id, job_title) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${job_title}"?`
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:5000/job/${job_id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        alert("Job deleted successfully!");
        setProfile((prev) => ({
          ...prev,
          jobs: prev.jobs.filter((job) => job.job_id !== job_id),
        }));
      } else {
        alert(data.message || "Failed to delete job.");
      }
    } catch (err) {
      console.error("Error deleting job:", err);
      alert("Something went wrong while deleting the job.");
    }
  };

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
                  Employer Dashboard
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
                  Employer Dashboard
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
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-500/30">
              AI
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm sm:text-base">
                Employer Dashboard
              </span>
              <span className="text-xs text-slate-400">
                Welcome, {profile.name}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/add-job")}
              className="rounded-xl border border-blue-500/60 bg-blue-600/90 px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-md shadow-blue-500/40 hover:bg-blue-500 transition-transform hover:scale-[1.02] active:scale-95"
            >
              Add Job
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
          {/* Employer profile card */}
          <div className="bg-slate-900/70 border border-white/10 rounded-2xl shadow-2xl shadow-blue-500/20 p-6 sm:p-8 backdrop-blur">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold mb-1">
                  Employer Profile
                </h1>
                <p className="text-xs sm:text-sm text-slate-300">
                  These details appear on your job postings and in applicant
                  views.
                </p>
              </div>
              <div className="flex flex-col items-start sm:items-end text-xs sm:text-sm text-slate-300">
                <span>
                  Company:{" "}
                  <span className="font-medium text-slate-100">
                    {profile.company}
                  </span>
                </span>
                <span>
                  Designation:{" "}
                  <span className="font-medium text-slate-100">
                    {profile.post}
                  </span>
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 text-sm text-slate-200">
              <p>
                <span className="text-slate-400">Name: </span>
                <span className="font-medium">{profile.name}</span>
              </p>
              <p>
                <span className="text-slate-400">Company: </span>
                <span className="font-medium">{profile.company}</span>
              </p>
              <p>
                <span className="text-slate-400">Post: </span>
                <span className="font-medium">{profile.post}</span>
              </p>
            </div>
          </div>

          {/* Jobs created card */}
          <div className="bg-slate-900/70 border border-white/10 rounded-2xl shadow-xl shadow-blue-500/10 p-6 sm:p-8 backdrop-blur">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-blue-300">
                Jobs You Have Created
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Manage your job postings and review applicants.
              </p>
            </div>

            {Array.isArray(profile.jobs) && profile.jobs.length > 0 ? (
              <ul className="space-y-4">
                {profile.jobs.map((job) => (
                  <li
                    key={job.job_id}
                    className="rounded-xl border border-white/10 bg-slate-950/70 p-4 sm:p-5 shadow-md shadow-slate-950/60"
                  >
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-50 mb-1">
                      {job.job_title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 mb-2">
                      {job.job_description}
                    </p>
                    <span className="inline-flex items-center text-xs sm:text-sm text-slate-200 bg-slate-800/80 px-2.5 py-1 rounded-full">
                      Role:{" "}
                      <span className="ml-1 font-medium">{job.job_role}</span>
                    </span>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        onClick={() =>
                          navigate(`/job/${job.job_id}/applicants`)
                        }
                        className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-md shadow-emerald-500/40 hover:scale-[1.02] active:scale-95 transition-transform"
                      >
                        Show Applicants
                      </button>

                      <button
                        onClick={() =>
                          handleDeleteJob(job.job_id, job.job_title)
                        }
                        className="rounded-xl border border-red-500/70 bg-red-600/90 px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-md shadow-red-500/40 hover:bg-red-500 transition-transform hover:scale-[1.02] active:scale-95"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-300">
                You haven&apos;t created any jobs yet. Click{" "}
                <button
                  type="button"
                  onClick={() => navigate("/add-job")}
                  className="text-blue-300 underline underline-offset-2 hover:text-blue-200"
                >
                  Add Job
                </button>{" "}
                to post your first opening.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployerProfile;
