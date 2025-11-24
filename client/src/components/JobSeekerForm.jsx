import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const JobSeekerForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    college: "",
    degree: "",
    graduation_year: "",
    resume: null,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkJobSeekerProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/check/job-seeker", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.exists) {
          navigate("/job-seeker-profile");
        }
      } catch (err) {
        console.error("Failed to check job seeker profile", err);
      }
    };
    checkJobSeekerProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      return;
    }
    if (file && file.size > 5 * 1024 * 1024) {
      alert("File size should not exceed 5MB.");
      return;
    }
    setFormData((prev) => ({ ...prev, resume: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.resume) {
      alert("Please upload your resume (PDF only).");
      return;
    }

    setLoading(true);
    const body = new FormData();
    body.append("name", formData.name);
    body.append("college", formData.college);
    body.append("degree", formData.degree);
    body.append("graduation_year", formData.graduation_year);
    body.append("resume", formData.resume);

    try {
      const res = await fetch("http://localhost:5000/job-seeker-form", {
        method: "POST",
        credentials: "include",
        body,
      });
      const data = await res.json();
      if (data.Success === "true") {
        navigate("/job-seeker-profile");
      } else {
        alert("Failed to submit form.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const resumeName = formData.resume ? formData.resume.name : "No file selected";

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
                Job seeker onboarding
              </span>
            </div>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 bg-white/5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Complete your profile to get ranked
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow flex items-center justify-center px-4 py-10">
        <form
          onSubmit={handleSubmit}
          className="max-w-xl w-full bg-slate-900/70 border border-white/10 rounded-2xl shadow-2xl shadow-blue-500/20 p-6 sm:p-8 backdrop-blur space-y-5"
        >
          <div className="space-y-2 text-center mb-2">
            <h2 className="text-2xl sm:text-3xl font-semibold">
              Job Seeker Profile
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Fill in your details and upload your resume. Our AI engine will
              use this to match you with job descriptions.
            </p>
          </div>

          {/* Name */}
          <div className="space-y-1">
            <label className="block text-xs text-slate-300" htmlFor="name">
              Full Name<span className="text-red-400"> *</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="e.g., Mahender Singh"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full text-sm bg-slate-950/80 border border-white/15 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500/70 placeholder:text-slate-500"
            />
          </div>

          {/* College */}
          <div className="space-y-1">
            <label className="block text-xs text-slate-300" htmlFor="college">
              College / University<span className="text-red-400"> *</span>
            </label>
            <input
              type="text"
              id="college"
              name="college"
              placeholder="e.g., IIT Bombay"
              value={formData.college}
              onChange={handleChange}
              required
              className="w-full text-sm bg-slate-950/80 border border-white/15 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500/70 placeholder:text-slate-500"
            />
          </div>

          {/* Degree */}
          <div className="space-y-1">
            <label className="block text-xs text-slate-300" htmlFor="degree">
              Degree<span className="text-red-400"> *</span>
            </label>
            <input
              type="text"
              id="degree"
              name="degree"
              placeholder="e.g., B.Tech in Computer Science"
              value={formData.degree}
              onChange={handleChange}
              required
              className="w-full text-sm bg-slate-950/80 border border-white/15 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500/70 placeholder:text-slate-500"
            />
          </div>

          {/* Graduation year */}
          <div className="space-y-1">
            <label
              className="block text-xs text-slate-300"
              htmlFor="graduation_year"
            >
              Graduation Year<span className="text-red-400"> *</span>
            </label>
            <input
              type="number"
              id="graduation_year"
              name="graduation_year"
              placeholder="e.g., 2025"
              value={formData.graduation_year}
              onChange={handleChange}
              required
              className="w-full text-sm bg-slate-950/80 border border-white/15 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500/70 placeholder:text-slate-500"
            />
          </div>

          {/* Resume upload */}
          <div className="space-y-2">
            <label className="block text-xs text-slate-300">
              Resume (PDF only, max 5MB)<span className="text-red-400"> *</span>
            </label>

            <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-white/15 rounded-xl px-4 py-6 cursor-pointer bg-slate-950/60 hover:border-blue-500/70 hover:bg-slate-900 transition-colors">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
                required
              />
              <span className="text-xs sm:text-sm text-slate-300 mb-1">
                Drop your resume here or click to browse
              </span>
              <span className="text-[0.7rem] sm:text-xs text-slate-500">
                {resumeName}
              </span>
            </label>

            <p className="text-[0.7rem] text-slate-400">
              Your resume will be processed by the AI engine using TF-IDF,
              cosine similarity, and skill extraction for ranking.
            </p>
          </div>

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
                Submit profile
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                  →
                </span>
              </>
            )}
          </button>
        </form>
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

export default JobSeekerForm;
