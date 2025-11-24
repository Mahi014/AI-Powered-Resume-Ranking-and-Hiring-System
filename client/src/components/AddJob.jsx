import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddJob = () => {
  const navigate = useNavigate();
  const [job, setJob] = useState({
    job_title: "",
    job_description: "",
    job_role: "",
  });

  const handleChange = (e) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/add-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(job),
      });

      const data = await res.json();
      if (data.Success === "true") {
        alert("Job added successfully");
        navigate("/employer-profile");
      } else {
        alert("Failed to add job");
      }
    } catch (err) {
      console.error("Error adding job:", err);
      alert("Server error");
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
                Create a new job opening
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/employer-profile")}
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

      {/* Form Content */}
      <main className="flex-grow pt-24 pb-10 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto bg-slate-900/70 border border-white/10 rounded-2xl shadow-2xl shadow-blue-500/20 p-6 sm:p-8 backdrop-blur">
          <div className="space-y-2 mb-6">
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-50">
              Add New Job
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Define the role, responsibilities, and title. The AI engine will
              use this job description to rank applicants.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Job Title */}
            <div className="space-y-1">
              <label
                className="block text-xs text-slate-300"
                htmlFor="job_title"
              >
                Job Title<span className="text-red-400"> *</span>
              </label>
              <input
                type="text"
                id="job_title"
                name="job_title"
                value={job.job_title}
                onChange={handleChange}
                required
                placeholder="e.g., Backend Engineer"
                className="w-full text-sm bg-slate-950/80 border border-white/15 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500/70 placeholder:text-slate-500"
              />
            </div>

            {/* Job Description */}
            <div className="space-y-1">
              <label
                className="block text-xs text-slate-300"
                htmlFor="job_description"
              >
                Job Description<span className="text-red-400"> *</span>
              </label>
              <textarea
                id="job_description"
                name="job_description"
                value={job.job_description}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Describe responsibilities, required skills, and experience. This text will be used for TF-IDF and skill-matching."
                className="w-full text-sm bg-slate-950/80 border border-white/15 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500/70 placeholder:text-slate-500 resize-y"
              />
            </div>

            {/* Job Role */}
            <div className="space-y-1">
              <label className="block text-xs text-slate-300" htmlFor="job_role">
                Job Role<span className="text-red-400"> *</span>
              </label>
              <input
                type="text"
                id="job_role"
                name="job_role"
                value={job.job_role}
                onChange={handleChange}
                required
                placeholder="e.g., Software Development, Data Science"
                className="w-full text-sm bg-slate-950/80 border border-white/15 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500/70 placeholder:text-slate-500"
              />
            </div>

            <p className="text-[0.7rem] text-slate-400">
              Tip: A clear job description with explicit skills (React, Python,
              SQL, etc.) helps the AI rank resumes more accurately.
            </p>

            <button
              type="submit"
              className="group relative flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm sm:text-base font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md shadow-emerald-500/40 hover:scale-[1.02] active:scale-95 transition-transform"
            >
              Post Job
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                →
              </span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddJob;
